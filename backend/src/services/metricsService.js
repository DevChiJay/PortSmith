const mongoose = require('mongoose');
const UsageLog = require('../models/UsageLog');
const ApiKey = require('../models/ApiKey');
const ApiCatalog = require('../models/ApiCatalog');
const logger = require('../utils/logger');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Helper function to get cached data or fetch new data
 */
function getCachedOrFetch(key, fetchFunction, ttl = CACHE_TTL) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }
  
  return fetchFunction().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

/**
 * Helper function to get date range
 */
function getDateRange(range = '30d') {
  const now = new Date();
  let startDate;
  
  switch (range) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { startDate, endDate: now };
}

/**
 * Service for collecting and querying API usage metrics
 */
class MetricsService {
  /**
   * Get usage metrics for a specific user
   * @param {String} userId - User ID from Clerk
   * @param {Object} options - Query options (timeframe, etc.)
   * @returns {Object} Usage metrics
   */
  async getUserMetrics(userId, options = {}) {
    try {
      const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = options;
      
      const metrics = await UsageLog.aggregate([
        {
          $match: {
            userId,
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { 
              apiKeyId: '$apiKeyId',
              day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            successCount: {
              $sum: {
                $cond: [{ $lt: ['$responseStatus', 400] }, 1, 0]
              }
            },
            errorCount: {
              $sum: {
                $cond: [{ $gte: ['$responseStatus', 400] }, 1, 0]
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id.apiKeyId',
            dailyUsage: {
              $push: {
                day: '$_id.day',
                count: '$count',
                avgResponseTime: '$avgResponseTime',
                successCount: '$successCount',
                errorCount: '$errorCount'
              }
            },
            totalRequests: { $sum: '$count' },
            avgResponseTime: { $avg: '$avgResponseTime' },
            totalSuccesses: { $sum: '$successCount' },
            totalErrors: { $sum: '$errorCount' }
          }
        },
        {
          $lookup: {
            from: 'apikeys',
            localField: '_id',
            foreignField: '_id',
            as: 'keyInfo'
          }
        },
        {
          $unwind: '$keyInfo'
        },
        {
          $lookup: {
            from: 'apicatalogs',
            localField: 'keyInfo.apiId',
            foreignField: '_id',
            as: 'apiInfo'
          }
        },
        {
          $unwind: '$apiInfo'
        },
        {
          $project: {
            _id: 1,
            keyName: '$keyInfo.name',
            apiName: '$apiInfo.name',
            dailyUsage: 1,
            totalRequests: 1,
            avgResponseTime: 1,
            totalSuccesses: 1,
            totalErrors: 1,
            successRate: {
              $cond: [
                { $eq: ['$totalRequests', 0] },
                0,
                { $multiply: [{ $divide: ['$totalSuccesses', '$totalRequests'] }, 100] }
              ]
            }
          }
        }
      ]);
      
      return metrics;
    } catch (error) {
      logger.error('Error retrieving user metrics:', error);
      throw error;
    }
  }

  /**
   * Get usage metrics for a specific API key
   * @param {String} keyId - API Key ID
   * @param {String} userId - User ID from Clerk (for access control)
   * @param {Object} options - Query options (timeframe, etc.)
   * @returns {Object} Usage metrics for the specific key
   */
  async getKeyMetrics(keyId, userId, options = {}) {
    try {
      const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = options;
      
      const metrics = await UsageLog.aggregate([
        {
          $match: {
            apiKeyId: mongoose.Types.ObjectId(keyId),
            userId,
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              endpoint: '$endpoint',
              method: '$method'
            },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            successCount: {
              $sum: {
                $cond: [{ $lt: ['$responseStatus', 400] }, 1, 0]
              }
            },
            errorCount: {
              $sum: {
                $cond: [{ $gte: ['$responseStatus', 400] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { '_id.day': -1, count: -1 }
        }
      ]);
      
      // Organize by endpoint and method
      const endpointMetrics = {};
      
      metrics.forEach(item => {
        const endpoint = item._id.endpoint;
        const method = item._id.method;
        const day = item._id.day;
        
        if (!endpointMetrics[endpoint]) {
          endpointMetrics[endpoint] = {};
        }
        
        if (!endpointMetrics[endpoint][method]) {
          endpointMetrics[endpoint][method] = {
            totalRequests: 0,
            totalSuccesses: 0,
            totalErrors: 0,
            avgResponseTime: 0,
            dailyUsage: []
          };
        }
        
        const current = endpointMetrics[endpoint][method];
        
        current.totalRequests += item.count;
        current.totalSuccesses += item.successCount;
        current.totalErrors += item.errorCount;
        current.avgResponseTime = (current.avgResponseTime + item.avgResponseTime) / 2;
        current.dailyUsage.push({
          day,
          count: item.count,
          successCount: item.successCount,
          errorCount: item.errorCount,
          avgResponseTime: item.avgResponseTime
        });
      });
      
      return endpointMetrics;
    } catch (error) {
      logger.error(`Error retrieving metrics for key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Get overall system usage metrics (admin only)
   * @param {Object} options - Query options (timeframe, etc.)
   * @returns {Object} System-wide usage metrics
   */
  async getSystemMetrics(options = {}) {
    try {
      const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = options;
      
      const metrics = await UsageLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              apiId: '$apiId'
            },
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueKeys: { $addToSet: '$apiKeyId' },
            avgResponseTime: { $avg: '$responseTime' },
            successCount: {
              $sum: {
                $cond: [{ $lt: ['$responseStatus', 400] }, 1, 0]
              }
            },
            errorCount: {
              $sum: {
                $cond: [{ $gte: ['$responseStatus', 400] }, 1, 0]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'apicatalogs',
            localField: '_id.apiId',
            foreignField: '_id',
            as: 'apiInfo'
          }
        },
        {
          $unwind: '$apiInfo'
        },
        {
          $sort: { '_id.day': -1 }
        },
        {
          $group: {
            _id: '$_id.apiId',
            apiName: { $first: '$apiInfo.name' },
            dailyUsage: {
              $push: {
                day: '$_id.day',
                count: '$count',
                uniqueUsers: { $size: '$uniqueUsers' },
                uniqueKeys: { $size: '$uniqueKeys' },
                avgResponseTime: '$avgResponseTime',
                successCount: '$successCount',
                errorCount: '$errorCount'
              }
            },
            totalRequests: { $sum: '$count' },
            avgResponseTime: { $avg: '$avgResponseTime' },
            totalSuccesses: { $sum: '$successCount' },
            totalErrors: { $sum: '$errorCount' }
          }
        }
      ]);
      
      return metrics;
    } catch (error) {
      logger.error('Error retrieving system metrics:', error);
      throw error;
    }
  }

  /**
   * Get aggregated user overview metrics
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object} Aggregated user metrics
   */
  async getUserOverviewMetrics(userId, options = {}) {
    try {
      const cacheKey = `user-overview-${userId}-${JSON.stringify(options)}`;
      
      return getCachedOrFetch(cacheKey, async () => {
        const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = options;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get total API keys
        const totalKeys = await ApiKey.countDocuments({ userId });
        const activeKeys = await ApiKey.countDocuments({ userId, status: 'active' });

        // Get total requests
        const totalRequests = await UsageLog.countDocuments({
          userId: userId.toString(),
          timestamp: { $gte: startDate, $lte: endDate }
        });

        // Get requests in last 7 days
        const recentRequests = await UsageLog.countDocuments({
          userId: userId.toString(),
          timestamp: { $gte: sevenDaysAgo }
        });

        // Get success rate and error stats
        const requestStats = await UsageLog.aggregate([
          {
            $match: {
              userId: userId.toString(),
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRequests: { $sum: 1 },
              successCount: {
                $sum: {
                  $cond: [{ $lt: ['$responseStatus', 400] }, 1, 0]
                }
              },
              errorCount: {
                $sum: {
                  $cond: [{ $gte: ['$responseStatus', 400] }, 1, 0]
                }
              },
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]);

        const stats = requestStats.length > 0 ? requestStats[0] : {
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          avgResponseTime: 0
        };

        const successRate = stats.totalRequests > 0
          ? ((stats.successCount / stats.totalRequests) * 100).toFixed(2)
          : 100;

        // Get favorite APIs (most used)
        const favoriteApis = await UsageLog.aggregate([
          {
            $match: {
              userId: userId.toString(),
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$apiId',
              requestCount: { $sum: 1 }
            }
          },
          {
            $sort: { requestCount: -1 }
          },
          {
            $limit: 5
          },
          {
            $lookup: {
              from: 'apicatalogs',
              localField: '_id',
              foreignField: '_id',
              as: 'apiInfo'
            }
          },
          {
            $unwind: '$apiInfo'
          },
          {
            $project: {
              apiId: '$_id',
              apiName: '$apiInfo.name',
              requestCount: 1
            }
          }
        ]);

        // Get usage trend (daily for last 7 days)
        const usageTrend = await UsageLog.aggregate([
          {
            $match: {
              userId: userId.toString(),
              timestamp: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.day': 1 }
          },
          {
            $project: {
              _id: 0,
              date: '$_id.day',
              requests: '$count'
            }
          }
        ]);

        // Get count of unique APIs used
        const uniqueApisResult = await UsageLog.aggregate([
          {
            $match: {
              userId: userId.toString(),
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$apiId'
            }
          },
          {
            $count: 'uniqueApis'
          }
        ]);

        const uniqueApis = uniqueApisResult.length > 0 ? uniqueApisResult[0].uniqueApis : 0;

        return {
          overview: {
            totalKeys,
            activeKeys,
            totalRequests: stats.totalRequests,
            recentRequests,
            successRate: parseFloat(successRate),
            avgResponseTime: Math.round(stats.avgResponseTime),
            uniqueApis
          },
          favoriteApis,
          usageTrend
        };
      });
    } catch (error) {
      logger.error('Error getting user overview metrics:', error);
      throw error;
    }
  }

  /**
   * Get aggregated admin dashboard metrics
   * @param {Object} options - Query options
   * @returns {Object} Aggregated admin metrics
   */
  async getAdminDashboardMetrics(options = {}) {
    try {
      const cacheKey = `admin-dashboard-${JSON.stringify(options)}`;
      
      return getCachedOrFetch(cacheKey, async () => {
        const { startDate, endDate } = getDateRange(options.range || '30d');
        const User = require('../models/User');

        // Get total users
        const totalUsers = await User.countDocuments();

        // Get total API keys
        const totalKeys = await ApiKey.countDocuments();

        // Get active keys
        const activeKeys = await ApiKey.countDocuments({ status: 'active' });

        // Get total requests
        const totalRequests = await UsageLog.countDocuments({
          timestamp: { $gte: startDate, $lte: endDate }
        });

        // Get active users (made requests in period)
        const activeUsersResult = await UsageLog.aggregate([
          {
            $match: {
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$userId'
            }
          },
          {
            $count: 'activeUsers'
          }
        ]);

        const activeUsers = activeUsersResult.length > 0 ? activeUsersResult[0].activeUsers : 0;

        // Get system-wide stats
        const systemStats = await UsageLog.aggregate([
          {
            $match: {
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRequests: { $sum: 1 },
              successCount: {
                $sum: {
                  $cond: [{ $lt: ['$responseStatus', 400] }, 1, 0]
                }
              },
              errorCount: {
                $sum: {
                  $cond: [{ $gte: ['$responseStatus', 400] }, 1, 0]
                }
              },
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]);

        const stats = systemStats.length > 0 ? systemStats[0] : {
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          avgResponseTime: 0
        };

        const successRate = stats.totalRequests > 0
          ? ((stats.successCount / stats.totalRequests) * 100).toFixed(2)
          : 100;

        // Get growth data (users and keys over time)
        const growthData = await this.getGrowthMetrics(startDate, endDate);

        // Get top APIs
        const topApis = await UsageLog.aggregate([
          {
            $match: {
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$apiId',
              requestCount: { $sum: 1 }
            }
          },
          {
            $sort: { requestCount: -1 }
          },
          {
            $limit: 10
          },
          {
            $lookup: {
              from: 'apicatalogs',
              localField: '_id',
              foreignField: '_id',
              as: 'apiInfo'
            }
          },
          {
            $unwind: '$apiInfo'
          },
          {
            $project: {
              apiId: '$_id',
              apiName: '$apiInfo.name',
              requestCount: 1
            }
          }
        ]);

        return {
          overview: {
            totalUsers,
            totalKeys,
            activeKeys,
            totalRequests: stats.totalRequests,
            activeUsers,
            successRate: parseFloat(successRate),
            errorRate: (100 - parseFloat(successRate)).toFixed(2),
            avgResponseTime: Math.round(stats.avgResponseTime)
          },
          growth: growthData,
          topApis
        };
      });
    } catch (error) {
      logger.error('Error getting admin dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get growth metrics (user registrations and API key creations over time)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Growth metrics
   */
  async getGrowthMetrics(startDate, endDate) {
    try {
      const User = require('../models/User');

      // Get user registrations by day
      const userGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.day': 1 }
        },
        {
          $project: {
            _id: 0,
            date: '$_id.day',
            users: '$count'
          }
        }
      ]);

      // Get API key creations by day
      const keyGrowth = await ApiKey.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.day': 1 }
        },
        {
          $project: {
            _id: 0,
            date: '$_id.day',
            keys: '$count'
          }
        }
      ]);

      // Merge the two datasets
      const growthMap = new Map();
      
      userGrowth.forEach(item => {
        growthMap.set(item.date, { date: item.date, users: item.users, keys: 0 });
      });

      keyGrowth.forEach(item => {
        const existing = growthMap.get(item.date);
        if (existing) {
          existing.keys = item.keys;
        } else {
          growthMap.set(item.date, { date: item.date, users: 0, keys: item.keys });
        }
      });

      return Array.from(growthMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      logger.error('Error getting growth metrics:', error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache() {
    cache.clear();
    logger.info('Metrics cache cleared');
  }
}

module.exports = new MetricsService();