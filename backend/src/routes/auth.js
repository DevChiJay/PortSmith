const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { requireAuth } = require('../middleware/auth');
const { handleAvatarUpload } = require('../middleware/upload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

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
