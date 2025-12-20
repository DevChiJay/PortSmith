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
          isPro: user.isPro || false,
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
    const { role, full_name, is_verified, isPro } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (full_name) updateData.full_name = full_name;
    if (typeof is_verified === 'boolean') updateData.is_verified = is_verified;
    if (typeof isPro === 'boolean') updateData.isPro = isPro;

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
        isVerified: user.is_verified,
        isPro: user.isPro || false
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

/**
 * Create new API
 */
exports.createApi = async (req, res) => {
  try {
    const { name, slug, description, baseUrl, documentation, endpoints, authType, defaultRateLimit } = req.body;

    // Validate required fields
    if (!name || !slug || !description || !baseUrl) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, slug, description, and base URL are required'
      });
    }

    // Check if slug already exists
    const existingApi = await ApiCatalog.findOne({ slug: slug.toLowerCase() });
    if (existingApi) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An API with this slug already exists'
      });
    }

    // Create new API
    const newApi = new ApiCatalog({
      name,
      slug: slug.toLowerCase(),
      description,
      baseUrl,
      documentation: documentation || '',
      endpoints: endpoints || [],
      authType: authType || 'apiKey',
      defaultRateLimit: defaultRateLimit || {
        requests: 100,
        per: 60 * 60 * 1000
      },
      isActive: true
    });

    await newApi.save();

    logger.info(`Admin ${req.user.id} created new API: ${name} (${slug})`);

    res.status(201).json({
      message: 'API created successfully',
      api: {
        id: newApi._id,
        name: newApi.name,
        slug: newApi.slug,
        description: newApi.description,
        baseUrl: newApi.baseUrl,
        isActive: newApi.isActive
      }
    });
  } catch (error) {
    logger.error('Error creating API:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create API'
    });
  }
};

/**
 * Update existing API
 */
exports.updateApi = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, baseUrl, documentation, endpoints, authType, defaultRateLimit, isActive } = req.body;

    const api = await ApiCatalog.findById(id);
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API not found'
      });
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug.toLowerCase() !== api.slug) {
      const existingApi = await ApiCatalog.findOne({ slug: slug.toLowerCase() });
      if (existingApi) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An API with this slug already exists'
        });
      }
    }

    // Update fields
    if (name) api.name = name;
    if (slug) api.slug = slug.toLowerCase();
    if (description) api.description = description;
    if (baseUrl) api.baseUrl = baseUrl;
    if (documentation !== undefined) api.documentation = documentation;
    if (endpoints) api.endpoints = endpoints;
    if (authType) api.authType = authType;
    if (defaultRateLimit) api.defaultRateLimit = defaultRateLimit;
    if (typeof isActive === 'boolean') api.isActive = isActive;
    
    api.updatedAt = Date.now();

    await api.save();

    logger.info(`Admin ${req.user.id} updated API: ${api.name} (${api.slug})`);

    res.json({
      message: 'API updated successfully',
      api: {
        id: api._id,
        name: api.name,
        slug: api.slug,
        description: api.description,
        baseUrl: api.baseUrl,
        isActive: api.isActive
      }
    });
  } catch (error) {
    logger.error(`Error updating API ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update API'
    });
  }
};

/**
 * Delete API
 */
exports.deleteApi = async (req, res) => {
  try {
    const { id } = req.params;

    const api = await ApiCatalog.findById(id);
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API not found'
      });
    }

    // Check if there are active API keys for this API
    const activeKeyCount = await ApiKey.countDocuments({ apiId: id, status: 'active' });
    if (activeKeyCount > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Cannot delete API. There are ${activeKeyCount} active API keys using this API. Please revoke all keys first.`
      });
    }

    // Delete all API keys for this API
    await ApiKey.deleteMany({ apiId: id });

    // Delete all usage logs for this API
    await UsageLog.deleteMany({ apiId: id });

    // Delete the API
    await ApiCatalog.findByIdAndDelete(id);

    logger.info(`Admin ${req.user.id} deleted API: ${api.name} (${api.slug})`);

    res.json({
      message: 'API and associated data deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting API ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete API'
    });
  }
};

/**
 * Get all API keys with user and API information
 */
exports.getAllKeys = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const apiId = req.query.apiId || '';

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (apiId) {
      query.apiId = apiId;
    }

    // Get total count
    const totalKeys = await ApiKey.countDocuments(query);

    // Get keys with user and API data
    let keys = await ApiKey.find(query)
      .populate('userId', 'email full_name avatar_url')
      .populate('apiId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Apply search filter after population
    if (search) {
      keys = keys.filter(key => 
        key.name.toLowerCase().includes(search.toLowerCase()) ||
        key.userId?.email.toLowerCase().includes(search.toLowerCase()) ||
        key.userId?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        key.apiId?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Get usage stats for each key
    const keysWithStats = await Promise.all(
      keys.map(async (key) => {
        const requestCount = await UsageLog.countDocuments({ apiKeyId: key._id });
        const lastUsed = await UsageLog.findOne({ apiKeyId: key._id })
          .sort({ timestamp: -1 })
          .select('timestamp')
          .lean();

        return {
          id: key._id,
          name: key.name,
          key: key.key,
          status: key.status,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt,
          lastUsed: lastUsed?.timestamp || null,
          requestCount,
          user: key.userId ? {
            id: key.userId._id,
            email: key.userId.email,
            name: key.userId.full_name,
            avatarUrl: key.userId.avatar_url
          } : null,
          api: key.apiId ? {
            id: key.apiId._id,
            name: key.apiId.name,
            slug: key.apiId.slug
          } : null,
          rateLimit: key.rateLimit
        };
      })
    );

    res.json({
      keys: keysWithStats,
      pagination: {
        page,
        limit,
        totalKeys,
        totalPages: Math.ceil(totalKeys / limit),
        hasMore: skip + limit < totalKeys
      }
    });
  } catch (error) {
    logger.error('Error getting all API keys:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API keys'
    });
  }
};

/**
 * Update API key (status and/or expiry)
 */
exports.updateKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expiresAt } = req.body;

    const updateData = {};

    // Validate and add status if provided
    if (status) {
      if (!['active', 'inactive', 'revoked'].includes(status)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Status must be one of: active, inactive, revoked'
        });
      }
      updateData.status = status;
    }

    // Validate and add expiry date if provided
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid date format'
        });
      }

      if (expiryDate < new Date()) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Expiry date cannot be in the past'
        });
      }
      updateData.expiresAt = expiryDate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No valid fields to update'
      });
    }

    const key = await ApiKey.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('userId', 'email full_name')
      .populate('apiId', 'name slug')
      .lean();

    if (!key) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found'
      });
    }

    const updates = [];
    if (status) updates.push(`status to ${status}`);
    if (expiresAt) updates.push(`expiry to ${new Date(expiresAt).toISOString()}`);
    logger.info(`Admin ${req.user.id} updated key ${id}: ${updates.join(', ')}`);

    res.json({
      message: 'API key updated successfully',
      key: {
        id: key._id,
        name: key.name,
        status: key.status,
        expiresAt: key.expiresAt,
        user: key.userId ? {
          email: key.userId.email,
          name: key.userId.full_name
        } : null,
        api: key.apiId ? {
          name: key.apiId.name
        } : null
      }
    });
  } catch (error) {
    logger.error(`Error updating key ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update API key'
    });
  }
};

/**
 * Delete API key
 */
exports.deleteKey = async (req, res) => {
  try {
    const { id } = req.params;

    const key = await ApiKey.findById(id)
      .populate('userId', 'email full_name')
      .populate('apiId', 'name slug')
      .lean();

    if (!key) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found'
      });
    }

    // Delete the key
    await ApiKey.findByIdAndDelete(id);

    // Delete all usage logs for this key
    await UsageLog.deleteMany({ apiKeyId: id });

    logger.info(`Admin ${req.user.id} deleted API key ${id} (${key.name}) for user ${key.userId?.email}`);

    res.json({
      message: 'API key and associated usage logs deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting key ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete API key'
    });
  }
};

