const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { requireAuth } = require('../middleware/auth');
const { handleAvatarUpload } = require('../middleware/upload');
const passport = require('../config/passport');
const { generateTokenPair } = require('../utils/jwt');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      // Generate JWT tokens for the authenticated user
      const { accessToken, refreshToken } = generateTokenPair(
        req.user._id.toString(),
        req.user.email,
        req.user.role
      );
      
      // Encode tokens for URL
      const encodedAccessToken = encodeURIComponent(accessToken);
      const encodedRefreshToken = encodeURIComponent(refreshToken);
      
      // Redirect to frontend with both tokens
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?` +
        `accessToken=${encodedAccessToken}&refreshToken=${encodedRefreshToken}`
      );
    } catch (error) {
      console.error('Error generating tokens:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
    }
  }
);

// GitHub OAuth routes
router.get('/github', 
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=github_auth_failed`
  }),
  (req, res) => {
    try {
      // Generate JWT tokens for the authenticated user
      const { accessToken, refreshToken } = generateTokenPair(
        req.user._id.toString(),
        req.user.email,
        req.user.role
      );
      
      // Encode tokens for URL
      const encodedAccessToken = encodeURIComponent(accessToken);
      const encodedRefreshToken = encodeURIComponent(refreshToken);
      
      // Redirect to frontend with both tokens
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?` +
        `accessToken=${encodedAccessToken}&refreshToken=${encodedRefreshToken}`
      );
    } catch (error) {
      console.error('Error generating tokens:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
    }
  }
);

// Handler for unauthorized requests
router.get('/unauthorized', (req, res) => {
  res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required to access this resource'
  });
});

// Protected routes (require JWT authentication)
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/logout', requireAuth, authController.logout);
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/avatar', requireAuth, handleAvatarUpload, authController.uploadAvatar);
router.delete('/avatar', requireAuth, authController.deleteAvatar);

module.exports = router;
