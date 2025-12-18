const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const ApiCatalog = require('../models/ApiCatalog');
const UsageLog = require('../models/UsageLog');
const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Get admin dashboard overview analytics
 * Returns total users, total API keys, total requests (last 30 days), active users count
 */
exports.getOverviewAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total API keys count
    const totalApiKeys = await ApiKey.countDocuments();

    // Get active API keys count
    const activeApiKeys = await ApiKey.countDocuments({ status: 'active' });

    // Get total requests in last 30 days
    const totalRequests = await UsageLog.countDocuments({
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Get active users count (users who made requests in last 7 days)
    const activeUsersResult = await UsageLog.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
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

    // Get new users in last 30 days
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get total APIs
    const totalApis = await ApiCatalog.countDocuments({ isActive: true });

    // Calculate success rate
    const errorCount = await UsageLog.countDocuments({
      timestamp: { $gte: thirtyDaysAgo },
      responseStatus: { $gte: 400 }
    });

    const successRate = totalRequests > 0 
      ? ((totalRequests - errorCount) / totalRequests * 100).toFixed(2)
      : 100;

    // Get average response time
    const avgResponseTimeResult = await UsageLog.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const avgResponseTime = avgResponseTimeResult.length > 0 
      ? Math.round(avgResponseTimeResult[0].avgResponseTime)
      : 0;

    res.json({
      overview: {
        totalUsers,
        totalApiKeys,
        activeApiKeys,
        totalRequests,
        activeUsers,
        newUsers,
        totalApis,
        successRate: parseFloat(successRate),
        avgResponseTime,
        period: '30 days'
      }
    });
  } catch (error) {
    logger.error('Error getting admin overview analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve overview analytics'
    });
  }
};

/**
 * Get paginated user list with analytics
 * Returns users with join date, API key count, last activity, total requests
 */
exports.getUsersAnalytics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build search query
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === 'verified') {
      query.is_verified = true;
    } else if (status === 'unverified') {
      query.is_verified = false;
    }

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select('email full_name role is_verified createdAt avatar_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get additional analytics for each user
    const usersWithAnalytics = await Promise.all(
      users.map(async (user) => {
        // Get API key count
        const apiKeyCount = await ApiKey.countDocuments({ userId: user._id });

        // Get active API key count
        const activeKeyCount = await ApiKey.countDocuments({ 
          userId: user._id, 
          status: 'active' 
        });

        // Get total requests
        const totalRequests = await UsageLog.countDocuments({ 
          userId: user._id.toString() 
        });

        // Get last activity (most recent request)
        const lastActivity = await UsageLog.findOne({ 
          userId: user._id.toString() 
        })
          .sort({ timestamp: -1 })
          .select('timestamp')
          .lean();

        return {
          id: user._id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          isVerified: user.is_verified,
          avatarUrl: user.avatar_url,
          joinDate: user.createdAt,
          apiKeyCount,
          activeKeyCount,
          totalRequests,
          lastActivity: lastActivity ? lastActivity.timestamp : null
        };
      })
    );

    res.json({
      users: usersWithAnalytics,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasMore: skip + limit < totalUsers
      }
    });
  } catch (error) {
    logger.error('Error getting users analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve users analytics'
    });
  }
};

/**
 * Get API usage statistics
 * Returns requests per API, active keys per API, error rates
 */
exports.getApisAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const start = startDate ? new Date(startDate) : thirtyDaysAgo;
    const end = endDate ? new Date(endDate) : new Date();

    // Get all active APIs
    const apis = await ApiCatalog.find({ isActive: true }).lean();

    // Get analytics for each API
    const apisWithAnalytics = await Promise.all(
      apis.map(async (api) => {
        // Get active keys for this API
        const activeKeys = await ApiKey.countDocuments({
          apiId: api._id,
          status: 'active'
        });

        // Get total keys for this API
        const totalKeys = await ApiKey.countDocuments({
          apiId: api._id
        });

        // Get request statistics
        const requestStats = await UsageLog.aggregate([
          {
            $match: {
              apiId: api._id,
              timestamp: { $gte: start, $lte: end }
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

        const errorRate = stats.totalRequests > 0
          ? ((stats.errorCount / stats.totalRequests) * 100).toFixed(2)
          : 0;

        const successRate = stats.totalRequests > 0
          ? ((stats.successCount / stats.totalRequests) * 100).toFixed(2)
          : 0;

        return {
          id: api._id,
          name: api.name,
          slug: api.slug,
          description: api.description,
          activeKeys,
          totalKeys,
          totalRequests: stats.totalRequests,
          successCount: stats.successCount,
          errorCount: stats.errorCount,
          errorRate: parseFloat(errorRate),
          successRate: parseFloat(successRate),
          avgResponseTime: Math.round(stats.avgResponseTime)
        };
      })
    );

    // Sort by total requests descending
    apisWithAnalytics.sort((a, b) => b.totalRequests - a.totalRequests);

    res.json({
      apis: apisWithAnalytics,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    logger.error('Error getting APIs analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve APIs analytics'
    });
  }
};

/**
 * Get recent activity log
 * Returns last 50 actions: key creation, API calls, user registrations
 */
exports.getActivityLog = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activityType = req.query.type || 'all'; // all, requests, keys, users

    const activities = [];

    // Get recent API requests if requested
    if (activityType === 'all' || activityType === 'requests') {
      const recentRequests = await UsageLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate({
          path: 'apiKeyId',
          select: 'name userId',
          populate: {
            path: 'userId',
            select: 'email full_name'
          }
        })
        .populate('apiId', 'name')
        .lean();

      recentRequests.forEach(req => {
        if (req.apiKeyId && req.apiKeyId.userId) {
          activities.push({
            type: 'api_request',
            timestamp: req.timestamp,
            description: `API request to ${req.apiId?.name || 'Unknown API'} - ${req.method} ${req.endpoint}`,
            status: req.responseStatus < 400 ? 'success' : 'error',
            user: {
              id: req.apiKeyId.userId._id,
              email: req.apiKeyId.userId.email,
              name: req.apiKeyId.userId.full_name
            },
            metadata: {
              apiName: req.apiId?.name,
              method: req.method,
              endpoint: req.endpoint,
              responseStatus: req.responseStatus,
              responseTime: req.responseTime
            }
          });
        }
      });
    }

    // Get recent API key creations if requested
    if (activityType === 'all' || activityType === 'keys') {
      const recentKeys = await ApiKey.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'email full_name')
        .populate('apiId', 'name')
        .lean();

      recentKeys.forEach(key => {
        if (key.userId) {
          activities.push({
            type: 'key_created',
            timestamp: key.createdAt,
            description: `API key "${key.name}" created for ${key.apiId?.name || 'Unknown API'}`,
            status: 'success',
            user: {
              id: key.userId._id,
              email: key.userId.email,
              name: key.userId.full_name
            },
            metadata: {
              keyName: key.name,
              apiName: key.apiId?.name,
              keyStatus: key.status
            }
          });
        }
      });
    }

    // Get recent user registrations if requested
    if (activityType === 'all' || activityType === 'users') {
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('email full_name createdAt role')
        .lean();

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registered',
          timestamp: user.createdAt,
          description: `New user registered: ${user.full_name}`,
          status: 'success',
          user: {
            id: user._id,
            email: user.email,
            name: user.full_name
          },
          metadata: {
            role: user.role
          }
        });
      });
    }

    // Sort all activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);

    res.json({
      activities: limitedActivities,
      count: limitedActivities.length
    });
  } catch (error) {
    logger.error('Error getting activity log:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve activity log'
    });
  }
};

/**
 * Get user details by ID (admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select('-password -verification_token -verification_token_expires')
      .lean();

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Get user's API keys
    const apiKeys = await ApiKey.find({ userId })
      .populate('apiId', 'name slug')
      .select('name status createdAt expiresAt lastUsed')
      .lean();

    // Get user's total requests
    const totalRequests = await UsageLog.countDocuments({ 
      userId: userId.toString() 
    });

    // Get recent activity
    const recentActivity = await UsageLog.find({ userId: userId.toString() })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('apiId', 'name')
      .select('endpoint method responseStatus timestamp')
      .lean();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        isVerified: user.is_verified,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        createdAt: user.createdAt,
        googleId: user.googleId ? 'Connected' : null,
        githubId: user.githubId ? 'Connected' : null
      },
      apiKeys,
      totalRequests,
      recentActivity
    });
  } catch (error) {
    logger.error(`Error getting user ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user details'
    });
  }
};

/**
 * Update user details (admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role, full_name, is_verified } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (full_name) updateData.full_name = full_name;
    if (typeof is_verified === 'boolean') updateData.is_verified = is_verified;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -verification_token -verification_token_expires');

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    logger.info(`Admin ${req.user.id} updated user ${userId}`);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        isVerified: user.is_verified
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user'
    });
  }
};

/**
 * Delete user (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Delete user's API keys
    await ApiKey.deleteMany({ userId });

    // Delete user's usage logs
    await UsageLog.deleteMany({ userId: userId.toString() });

    logger.info(`Admin ${req.user.id} deleted user ${userId}`);

    res.json({
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete user'
    });
  }
};
