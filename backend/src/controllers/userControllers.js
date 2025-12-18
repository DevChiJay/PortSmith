const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const UsageLog = require('../models/UsageLog');
const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');

/**
 * Get user's dashboard overview metrics
 * Returns total requests, active keys, favorite APIs, usage trend
 */
exports.getOverviewMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Use the metrics service to get aggregated data
    const metrics = await metricsService.getUserOverviewMetrics(userId, {
      startDate: thirtyDaysAgo
    });

    res.json(metrics);
  } catch (error) {
    logger.error(`Error getting overview metrics for user ${req.user.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user metrics'
    });
  }
};

/**
 * Get user's daily request timeline
 * Returns daily request counts for the last 30 days
 */
exports.getTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const start = startDate ? new Date(startDate) : thirtyDaysAgo;
    const end = endDate ? new Date(endDate) : new Date();

    // Get daily timeline data
    const timeline = await UsageLog.aggregate([
      {
        $match: {
          userId: userId.toString(),
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
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
      },
      {
        $sort: { '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.day',
          totalRequests: 1,
          successCount: 1,
          errorCount: 1,
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          successRate: {
            $cond: [
              { $eq: ['$totalRequests', 0] },
              0,
              { 
                $round: [
                  { $multiply: [{ $divide: ['$successCount', '$totalRequests'] }, 100] },
                  2
                ]
              }
            ]
          }
        }
      }
    ]);

    // Fill in missing days with zero values
    const timelineMap = new Map(timeline.map(day => [day.date, day]));
    const filledTimeline = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (timelineMap.has(dateStr)) {
        filledTimeline.push(timelineMap.get(dateStr));
      } else {
        filledTimeline.push({
          date: dateStr,
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          avgResponseTime: 0,
          successRate: 0
        });
      }
    }

    res.json({
      timeline: filledTimeline,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    logger.error(`Error getting timeline for user ${req.user.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve timeline data'
    });
  }
};

/**
 * Get user notifications
 * Returns key expiring soon, quota warnings, system updates
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = [];
    
    // Check for expiring keys (expiring in next 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expiringKeys = await ApiKey.find({
      userId,
      status: 'active',
      expiresAt: {
        $gte: new Date(),
        $lte: sevenDaysFromNow
      }
    }).populate('apiId', 'name').lean();

    expiringKeys.forEach(key => {
      const daysUntilExpiry = Math.ceil((key.expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `expiring-${key._id}`,
        type: 'warning',
        category: 'key_expiring',
        title: 'API Key Expiring Soon',
        message: `Your API key "${key.name}" for ${key.apiId.name} will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/dashboard/my-keys`,
        metadata: {
          keyId: key._id,
          keyName: key.name,
          apiName: key.apiId.name,
          expiresAt: key.expiresAt,
          daysRemaining: daysUntilExpiry
        }
      });
    });

    // Check for inactive keys (created but never used)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const inactiveKeys = await ApiKey.find({
      userId,
      status: 'active',
      createdAt: { $lte: sevenDaysAgo },
      lastUsed: null
    }).populate('apiId', 'name').lean();

    inactiveKeys.forEach(key => {
      notifications.push({
        id: `inactive-${key._id}`,
        type: 'info',
        category: 'key_inactive',
        title: 'Unused API Key',
        message: `Your API key "${key.name}" for ${key.apiId.name} hasn't been used yet`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/docs/${key.apiId.slug}`,
        metadata: {
          keyId: key._id,
          keyName: key.name,
          apiName: key.apiId.name
        }
      });
    });

    // Check for high error rates (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errorStats = await UsageLog.aggregate([
      {
        $match: {
          userId: userId.toString(),
          timestamp: { $gte: twentyFourHoursAgo }
        }
      },
      {
        $group: {
          _id: '$apiKeyId',
          totalRequests: { $sum: 1 },
          errorCount: {
            $sum: {
              $cond: [{ $gte: ['$responseStatus', 400] }, 1, 0]
            }
          }
        }
      },
      {
        $match: {
          totalRequests: { $gte: 10 }, // Only consider keys with at least 10 requests
          $expr: {
            $gte: [
              { $divide: ['$errorCount', '$totalRequests'] },
              0.3 // 30% error rate threshold
            ]
          }
        }
      }
    ]);

    if (errorStats.length > 0) {
      for (const stat of errorStats) {
        const key = await ApiKey.findById(stat._id).populate('apiId', 'name').lean();
        if (key) {
          const errorRate = ((stat.errorCount / stat.totalRequests) * 100).toFixed(1);
          notifications.push({
            id: `error-rate-${key._id}`,
            type: 'error',
            category: 'high_error_rate',
            title: 'High Error Rate Detected',
            message: `API key "${key.name}" has a ${errorRate}% error rate in the last 24 hours`,
            timestamp: new Date(),
            read: false,
            actionUrl: `/dashboard/my-keys`,
            metadata: {
              keyId: key._id,
              keyName: key.name,
              apiName: key.apiId.name,
              errorRate: parseFloat(errorRate),
              totalRequests: stat.totalRequests,
              errorCount: stat.errorCount
            }
          });
        }
      }
    }

    // Add a welcome notification for new users (joined in last 7 days)
    const user = await User.findById(userId).lean();
    if (user && user.createdAt >= sevenDaysAgo) {
      notifications.push({
        id: 'welcome',
        type: 'success',
        category: 'welcome',
        title: 'Welcome to PortSmith!',
        message: 'Get started by creating your first API key and exploring our API catalog',
        timestamp: user.createdAt,
        read: false,
        actionUrl: '/dashboard/available-apis',
        metadata: {}
      });
    }

    // Sort by timestamp descending (most recent first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      total: notifications.length
    });
  } catch (error) {
    logger.error(`Error getting notifications for user ${req.user.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve notifications'
    });
  }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password -verification_token -verification_token_expires')
      .lean();

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.full_name ? user.full_name.split(' ')[0] : '',
        lastName: user.full_name ? user.full_name.split(' ').slice(1).join(' ') : '',
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        isVerified: user.is_verified,
        role: user.role,
        createdAt: user.createdAt,
        hasGoogleAuth: !!user.googleId,
        hasGithubAuth: !!user.githubId
      }
    });
  } catch (error) {
    logger.error(`Error getting profile for user ${req.user.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone } = req.body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;

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

    logger.info(`User ${userId} updated their profile`);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating profile for user ${req.user.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
};
