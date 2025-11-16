const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * JWT Utility Functions
 * Handles token generation and verification for authentication
 */

/**
 * Generate JWT access token
 * @param {String} userId - User ID from MongoDB
 * @param {String} email - User email
 * @param {String} role - User role (user/admin)
 * @returns {String} JWT access token
 */
const generateAccessToken = (userId, email, role) => {
  try {
    const payload = {
      userId,
      email,
      role,
      type: 'access'
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.JWT_EXPIRE || '24h';

    const token = jwt.sign(payload, secret, {
      expiresIn,
      issuer: 'PortSmith',
      audience: 'PortSmith-Users'
    });

    logger.debug(`Access token generated for user ${userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw error;
  }
};

/**
 * Generate JWT refresh token
 * @param {String} userId - User ID from MongoDB
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  try {
    const payload = {
      userId,
      type: 'refresh'
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';

    const token = jwt.sign(payload, secret, {
      expiresIn,
      issuer: 'PortSmith',
      audience: 'PortSmith-Users'
    });

    logger.debug(`Refresh token generated for user ${userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
};

/**
 * Verify JWT access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'PortSmith',
      audience: 'PortSmith-Users'
    });

    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type. Expected access token.');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expired');
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token');
      throw new Error('Invalid token');
    }
    logger.error('Error verifying access token:', error);
    throw error;
  }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'PortSmith',
      audience: 'PortSmith-Users'
    });

    // Verify token type
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type. Expected refresh token.');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Refresh token expired');
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid refresh token');
      throw new Error('Invalid refresh token');
    }
    logger.error('Error verifying refresh token:', error);
    throw error;
  }
};

/**
 * Generate both access and refresh tokens
 * @param {String} userId - User ID from MongoDB
 * @param {String} email - User email
 * @param {String} role - User role
 * @returns {Object} Object containing both tokens
 */
const generateTokenPair = (userId, email, role) => {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair
};
