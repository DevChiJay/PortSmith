const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { requireAuth } = require('../middleware/auth');

// Apply authentication to all user routes
router.use(requireAuth);

// User metrics endpoints
router.get('/metrics/overview', userController.getOverviewMetrics);
router.get('/metrics/timeline', userController.getTimeline);

// User notifications
router.get('/notifications', userController.getNotifications);

// User profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
