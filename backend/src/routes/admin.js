const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin authorization to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin analytics endpoints
router.get('/analytics/overview', adminController.getOverviewAnalytics);
router.get('/analytics/users', adminController.getUsersAnalytics);
router.get('/analytics/apis', adminController.getApisAnalytics);
router.get('/analytics/activity', adminController.getActivityLog);

// Admin user management endpoints
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Admin API management endpoints
router.post('/apis', adminController.createApi);
router.put('/apis/:id', adminController.updateApi);
router.delete('/apis/:id', adminController.deleteApi);

// Admin API keys management endpoints
router.get('/keys', adminController.getAllKeys);
router.put('/keys/:id', adminController.updateKey);
router.delete('/keys/:id', adminController.deleteKey);

module.exports = router;
