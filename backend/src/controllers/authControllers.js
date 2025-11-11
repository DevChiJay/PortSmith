const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide a valid email address'
      });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username must be at least 3 characters long'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        error: 'Conflict',
        message: `User with this ${field} already exists`
      });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      username,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'user' // Default to 'user', only allow 'admin' if explicitly set
    });

    await user.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokenPair(
      user._id.toString(),
      user.email,
      user.role
    );

    // Prepare user data (exclude password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    logger.info(`New user registered: ${user.email} (${user._id})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if ((!email && !username) || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username
    const query = email ? { email } : { username };
    const user = await User.findOne(query).select('+password');

    if (!user) {
      logger.warn(`Failed login attempt: User not found (${email || username})`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt: Invalid password for user ${user.email}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokenPair(
      user._id.toString(),
      user.email,
      user.role
    );

    // Prepare user data (exclude password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    logger.info(`User logged in: ${user.email} (${user._id})`);

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login'
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Fetch user to get latest data
    const user = await User.findById(decoded.userId);

    if (!user) {
      logger.warn(`Refresh token used for non-existent user: ${decoded.userId}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );

    logger.debug(`Access token refreshed for user: ${user.email}`);

    res.json({
      success: true,
      accessToken
    });
  } catch (error) {
    logger.warn('Refresh token error:', error.message);
    
    if (error.message === 'Refresh token expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token has expired. Please login again.',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Invalid refresh token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh token'
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing tokens
    // However, we can log the event for auditing purposes
    
    const userId = req.user?.id;
    if (userId) {
      logger.info(`User logged out: ${userId}`);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user from MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Prepare user data (exclude password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
};
