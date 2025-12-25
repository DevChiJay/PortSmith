const keyManagementService = require('../services/keyManagement');
const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');

// Get all keys for the authenticated user with usage statistics
exports.getUserKeys = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    const keys = await keyManagementService.getUserKeys(userId);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get usage statistics for each key
    const UsageLog = require('../models/UsageLog');
    const keyListWithStats = await Promise.all(
      keys.map(async (key) => {
        // Get total requests for this key
        const totalRequests = await UsageLog.countDocuments({ 
          apiKeyId: key._id 
        });

        // Get requests in last 7 days
        const last7DaysRequests = await UsageLog.countDocuments({
          apiKeyId: key._id,
          timestamp: { $gte: sevenDaysAgo }
        });

        // Get requests in last 30 days with success rate
        const last30DaysStats = await UsageLog.aggregate([
          {
            $match: {
              apiKeyId: key._id,
              timestamp: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              successCount: {
                $sum: {
                  $cond: [{ $lt: ['$responseStatus', 400] }, 1, 0]
                }
              },
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]);

        const stats30Days = last30DaysStats.length > 0 ? last30DaysStats[0] : {
          total: 0,
          successCount: 0,
          avgResponseTime: 0
        };

        const successRate = stats30Days.total > 0
          ? ((stats30Days.successCount / stats30Days.total) * 100).toFixed(2)
          : 0;

        // Get 7-day trend (daily breakdown)
        const trendData = await UsageLog.aggregate([
          {
            $match: {
              apiKeyId: key._id,
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
          }
        ]);

        const trend = trendData.map(d => ({
          date: d._id.day,
          requests: d.count
        }));

        return {
          id: key._id,
          name: key.name,
          apiName: key.apiId.name,
          apiId: key.apiId._id,
          status: key.status,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt,
          lastUsed: key.lastUsed,
          permissions: key.permissions,
          usage: {
            totalRequests,
            last7Days: last7DaysRequests,
            last30Days: stats30Days.total,
            successRate: parseFloat(successRate),
            avgResponseTime: Math.round(stats30Days.avgResponseTime || 0),
            trend
          }
        };
      })
    );
    
    res.json({ keys: keyListWithStats });
  } catch (error) {
    logger.error('Error getting user keys:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API keys'
    });
  }
};

// Get a specific key by ID
exports.getKeyById = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    const key = await keyManagementService.getKeyById(req.params.id, userId);
    
    res.json({
      id: key._id,
      name: key.name,
      key: key.key,
      apiName: key.apiId.name,
      apiId: key.apiId._id,
      status: key.status,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsed: key.lastUsed
    });
  } catch (error) {
    logger.error(`Error getting key ${req.params.id}:`, error);
    res.status(404).json({
      error: 'Not Found',
      message: 'API key not found or not owned by you'
    });
  }
};

// Generate a new API key
exports.generateKey = async (req, res) => {
  try {
    const { apiId, name, permissions, rateLimit, expiresAt } = req.body;
    
    if (!apiId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'API ID is required'
      });
    }
    
    const userId = req.user.id; // MongoDB ObjectId from JWT
    const keyData = { apiId, name, permissions, rateLimit, expiresAt };
    
    const newKey = await keyManagementService.generateKey(userId, keyData);
    
    logger.info(`User ${userId} created new API key for API ID ${apiId}`);
    
    res.status(201).json({
      id: newKey._id,
      name: newKey.name,
      key: newKey.key, // This will be shown only once
      apiId: newKey.apiId,
      status: newKey.status,
      permissions: newKey.permissions,
      rateLimit: newKey.rateLimit,
      createdAt: newKey.createdAt,
      expiresAt: newKey.expiresAt
    });
  } catch (error) {
    // Handle expected errors with status codes
    if (error.statusCode) {
      // Log operational errors at appropriate level
      if (error.code === 'KEY_LIMIT_EXCEEDED') {
        logger.info(`User ${req.user.id} attempted to exceed API key limit`);
      } else {
        logger.warn(`${error.code || 'Error'} in generateKey: ${error.message}`);
      }
      
      return res.status(error.statusCode).json({
        error: error.code || 'Error',
        message: error.message
      });
    }
    
    // Log unexpected errors
    logger.error('Error generating API key:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate API key'
    });
  }
};

// Revoke an API key
exports.revokeKey = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    const keyId = req.params.id;
    
    const revokedKey = await keyManagementService.revokeKey(keyId, userId);
    
    logger.info(`User ${userId} revoked API key ${keyId}`);
    
    res.json({
      id: revokedKey._id,
      status: revokedKey.status,
      message: 'API key has been revoked'
    });
  } catch (error) {
    logger.error(`Error revoking key ${req.params.id}:`, error);
    res.status(404).json({
      error: 'Not Found',
      message: 'API key not found or not owned by you'
    });
  }
};

// Update an API key
exports.updateKey = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    const keyId = req.params.id;
    const { name, status, permissions, rateLimit, expiresAt } = req.body;
    
    const updatedKey = await keyManagementService.updateKey(keyId, userId, {
      name, status, permissions, rateLimit, expiresAt
    });
    
    logger.info(`User ${userId} updated API key ${keyId}`);
    
    res.json({
      id: updatedKey._id,
      name: updatedKey.name,
      status: updatedKey.status,
      permissions: updatedKey.permissions,
      rateLimit: updatedKey.rateLimit,
      expiresAt: updatedKey.expiresAt,
      message: 'API key has been updated'
    });
  } catch (error) {
    logger.error(`Error updating key ${req.params.id}:`, error);
    res.status(404).json({
      error: 'Not Found',
      message: 'API key not found or not owned by you'
    });
  }
};

// Get usage metrics for a specific key
exports.getKeyMetrics = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    const keyId = req.params.id;
    
    // Ensure the key belongs to this user
    await keyManagementService.getKeyById(keyId, userId);
    
    const { startDate, endDate } = req.query;
    const options = {};
    
    if (startDate) {
      options.startDate = new Date(startDate);
    }
    
    if (endDate) {
      options.endDate = new Date(endDate);
    }
    
    const metrics = await metricsService.getKeyMetrics(keyId, userId, options);
    
    res.json({ metrics });
  } catch (error) {
    logger.error(`Error getting metrics for key ${req.params.id}:`, error);
    res.status(404).json({
      error: 'Not Found',
      message: 'API key not found or not owned by you'
    });
  }
};
