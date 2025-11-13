const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { sendVerificationEmail } = require('../utils/emailService');
const crypto = require('crypto');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Input validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Full name, email, and password are required'
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

    // Validate full name length
    if (full_name.trim().length < 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Full name must be at least 2 characters long'
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
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      full_name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'user', // Default to 'user', only allow 'admin' if explicitly set
      is_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.full_name, verificationToken);
      logger.info(`Verification email sent to: ${user.email} (${user._id})`);
    } catch (emailError) {
      logger.error(`Failed to send verification email to ${user.email}:`, emailError);
      // Don't fail registration if email fails - user can request resend
    }

    // Prepare user data (exclude password and tokens)
    const userData = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      createdAt: user.createdAt
    };

    logger.info(`New user registered: ${user.email} (${user._id})`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: userData,
      requiresVerification: true
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Failed login attempt: User not found (${email})`);
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

    // Check if email is verified
    if (!user.is_verified) {
      logger.warn(`Login attempt with unverified email: ${user.email}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Please verify your email address before logging in',
        code: 'EMAIL_NOT_VERIFIED'
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
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      is_verified: user.is_verified,
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
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      is_verified: user.is_verified,
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

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Verification token is required'
      });
    }

    // Find user with this verification token that hasn't expired
    const user = await User.findOne({
      verification_token: token,
      verification_token_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or expired verification token'
      });
    }

    // Mark user as verified and clear verification token
    user.is_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email} (${user._id})`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify email'
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verification_token = verificationToken;
    user.verification_token_expires = verificationTokenExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.full_name, verificationToken);
      logger.info(`Verification email resent to: ${user.email} (${user._id})`);
    } catch (emailError) {
      logger.error(`Failed to resend verification email to ${user.email}:`, emailError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email has been resent. Please check your inbox.'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to resend verification email'
    });
  }
};
