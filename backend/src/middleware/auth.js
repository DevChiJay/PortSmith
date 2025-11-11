const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware to handle JWT authentication
 * Extracts JWT from Authorization header, verifies it, and attaches user to request
 */
const requireAuth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Missing or invalid Authorization header for ${req.originalUrl}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    if (!token) {
      logger.warn(`Empty token in Authorization header for ${req.originalUrl}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    // Also set userId for backward compatibility
    req.userId = decoded.userId;
    
    logger.debug(`User ${decoded.userId} authenticated successfully for ${req.originalUrl}`);
    next();
  } catch (error) {
    logger.warn(`Authentication failed for ${req.originalUrl}: ${error.message}`);
    
    // Handle specific error cases
    if (error.message === 'Token expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware for admin-only routes
 * Requires valid JWT with admin role
 */
const requireAdmin = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Missing or invalid Authorization header for admin route ${req.originalUrl}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    if (!token) {
      logger.warn(`Empty token in Authorization header for admin route ${req.originalUrl}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      logger.warn(`Non-admin user ${decoded.userId} (${decoded.email}) attempted to access admin route ${req.originalUrl}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required for this resource'
      });
    }
    
    // Attach user info to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    // Also set userId for backward compatibility
    req.userId = decoded.userId;
    
    logger.debug(`Admin user ${decoded.userId} authenticated successfully for ${req.originalUrl}`);
    next();
  } catch (error) {
    logger.warn(`Admin authentication failed for ${req.originalUrl}: ${error.message}`);
    
    // Handle specific error cases
    if (error.message === 'Token expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed'
    });
  }
};

/**
 * Helper to get the current authenticated user from request
 * Note: This assumes requireAuth middleware has already run
 * @param {Object} req - Express request object
 * @returns {Object|null} User object or null
 */
const getCurrentUser = (req) => {
  if (!req.user) {
    return null;
  }
  
  return {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  };
};

module.exports = {
  requireAuth,
  requireAdmin,
  getCurrentUser
};