const apiConfigService = require('../config/apis');
const { createApiProxy } = require('../middleware/proxy');
const logger = require('../utils/logger');

// Handle API routing for PUBLIC gateway
exports.routeApiRequest = async (req, res, next) => {
  try {
    const { apiName } = req.params;
    const requestHost = req.hostname || req.headers.host?.split(':')[0];
    
    // Get API config from database
    const apiConfig = await apiConfigService.getApiConfig(apiName);
    
    if (!apiConfig) {
      logger.warn(`Attempt to access unknown API: ${apiName}`);
      return res.status(404).json({
        error: 'Not Found',
        message: `API '${apiName}' not found`
      });
    }

    // PHASE 2: Enforce visibility - PUBLIC gateway only serves PUBLIC APIs
    if (apiConfig.visibility !== 'public') {
      logger.warn(`Attempt to access ${apiConfig.visibility} API '${apiName}' from public gateway`);
      return res.status(404).json({
        error: 'Not Found',
        message: `API '${apiName}' not found`
      });
    }

    // Check if user's API key has access to this API
    if (req.apiKey.api.slug !== apiName) {
      logger.warn(`API key not authorized for ${apiName}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: `This API key does not have access to '${apiName}'`
      });
    }
    
    // Log rate limit information for debugging
    logger.debug(`Request to ${apiName} with key ${req.apiKey.key}. Rate limit: ${req.apiKey.rateLimit.requests} per ${req.apiKey.rateLimit.per}ms`);

    // Tag request with gateway type for logging
    req.gatewayType = 'public';

    // Create and apply proxy for this API
    const apiProxy = createApiProxy(apiConfig);
    apiProxy(req, res, next);
  } catch (error) {
    logger.error(`Error in gateway routing for ${req.params.apiName}:`, error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error processing gateway request'
    });
  }
};
