const express = require('express');
const router = express.Router();
const apisController = require('../controllers/apisControllers');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get all available APIs (public endpoint)
router.get('/', apisController.getAllApis);

// Get featured APIs (limited to first 6)
router.get('/featured', apisController.getFeaturedApis);

// Get API documentation (OpenAPI spec or Markdown HTML)
router.get('/:slug/docs', apisController.getApiDocs);

// Get raw OpenAPI spec (download)
router.get('/:slug/spec', apisController.getRawSpec);

// Get API by slug (detailed info)
router.get('/:slug', apisController.getApiBySlug);

// The following routes require authentication
router.use(requireAuth);

// Add a new API to the catalog (admin only)
router.post('/', requireAdmin, apisController.addApi);

// Update an API (admin only)
router.put('/:id', requireAdmin, apisController.updateApi);

// Delete an API (admin only)
router.delete('/:id', requireAdmin, apisController.deleteApi);

module.exports = router;