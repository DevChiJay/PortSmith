const rateLimit = require('express-rate-limit');
const { MemoryStore } = require('express-rate-limit');
const logger = require('../utils/logger');

// Create persistent stores for different rate limits
const rateLimitStores = {};

/**
 * Parse period string (e.g., "1 hour", "1 day", "30 days") to milliseconds
 * @param {string} period - Period string to parse
 * @returns {number} - Period in milliseconds
 */
const parsePeriod = (period) => {
  if (!period || typeof period !== 'string') return null;
  
  const match = period.trim().match(/^(\d+)\s*(hour|day|week|month|year)s?$/i);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const multipliers = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000
  };
  
  return value * (multipliers[unit] || 0);
};

/**
 * Creates a rate limiter based on API key settings
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes by default
    max: 100, // limit each IP to 100 requests per windowMs by default
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
      // Use API key as the rate limit key if available
      if (req.apiKey && req.apiKey.key) {
        return req.apiKey.key;
      }
      // Fall back to IP address
      return req.ip;
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for key: ${req.apiKey?.key || 'unknown'}`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
  };

  // Merge default options with user options
  const limiterOptions = { ...defaultOptions, ...options };
  
  // Create a unique identifier for this rate limiter configuration
  const limiterKey = `${limiterOptions.windowMs}_${limiterOptions.max}`;
  
  // Use existing store or create new one for this configuration
  if (!rateLimitStores[limiterKey]) {
    logger.debug(`Creating new rate limit store with window: ${limiterOptions.windowMs}ms, max: ${limiterOptions.max} requests`);
    rateLimitStores[limiterKey] = new MemoryStore();
  }
  
  // Use the persistent store
  limiterOptions.store = rateLimitStores[limiterKey];

  return rateLimit(limiterOptions);
};

// Cache for dynamic rate limiters to avoid creating new instances on every request
const dynamicLimiterCache = {};

/**
 * Dynamic rate limiter middleware that uses both API pricing limits and API key limits
 * Enforces the most restrictive limit between:
 * 1. API-level pricing (pricing.free or pricing.pro based on user.isPro)
 * 2. API key-level rate limit (apiKey.rateLimit)
 */
const dynamicRateLimiter = async (req, res, next) => {
  // If no API key on request, use default rate limits
  if (!req.apiKey || !req.apiKey.api) {
    return createRateLimiter()(req, res, next);
  }

  const api = req.apiKey.api;
  const apiKeyRateLimit = req.apiKey.rateLimit;
  
  // Determine which pricing tier to use based on user's isPro status
  let apiPricingLimit = null;
  
  if (req.user && req.user.isPro && api.pricing && api.pricing.pro) {
    // User is pro, use pro tier limits
    const proPeriod = parsePeriod(api.pricing.pro.period);
    if (api.pricing.pro.maxRequests && proPeriod) {
      apiPricingLimit = {
        requests: api.pricing.pro.maxRequests,
        per: proPeriod
      };
      logger.debug(`Using pro tier for API ${api.slug}: ${apiPricingLimit.requests} requests per ${apiPricingLimit.per}ms`);
    }
  } else if (api.pricing && api.pricing.free) {
    // Use free tier limits
    const freePeriod = parsePeriod(api.pricing.free.period);
    if (api.pricing.free.maxRequests && freePeriod) {
      apiPricingLimit = {
        requests: api.pricing.free.maxRequests,
        per: freePeriod
      };
      logger.debug(`Using free tier for API ${api.slug}: ${apiPricingLimit.requests} requests per ${apiPricingLimit.per}ms`);
    }
  }
  
  // Determine the most restrictive limit
  // We need to check both API-level pricing limits AND API key limits
  const limits = [];
  
  // Add API pricing limit if available
  if (apiPricingLimit) {
    limits.push({
      type: 'api-pricing',
      requests: apiPricingLimit.requests,
      per: apiPricingLimit.per
    });
  }
  
  // Add API key limit
  if (apiKeyRateLimit && apiKeyRateLimit.requests && apiKeyRateLimit.per) {
    limits.push({
      type: 'api-key',
      requests: apiKeyRateLimit.requests,
      per: apiKeyRateLimit.per
    });
  }
  
  // If no limits found, use default
  if (limits.length === 0) {
    logger.debug(`No rate limits configured, using defaults for key: ${req.apiKey.key}`);
    return createRateLimiter()(req, res, next);
  }
  
  // Apply all limits by chaining them
  // This ensures both API-level and key-level limits are enforced
  let currentIndex = 0;
  
  const applyNextLimit = (req, res, next) => {
    if (currentIndex >= limits.length) {
      return next();
    }
    
    const limit = limits[currentIndex];
    currentIndex++;
    
    logger.debug(`Checking ${limit.type} limit: ${limit.requests} requests per ${limit.per}ms for key: ${req.apiKey.key}`);
    
    // Create cache key for this specific limit
    const cacheKey = `${req.apiKey.key}_${limit.type}_${limit.requests}_${limit.per}`;
    
    // Use cached limiter or create a new one
    if (!dynamicLimiterCache[cacheKey]) {
      logger.debug(`Creating new ${limit.type} rate limiter for key: ${req.apiKey.key}`);
      dynamicLimiterCache[cacheKey] = createRateLimiter({
        windowMs: limit.per,
        max: limit.requests,
        handler: (req, res) => {
          logger.warn(`${limit.type} rate limit exceeded for key: ${req.apiKey.key} (${limit.requests} requests per ${limit.per}ms)`);
          return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded: ${limit.type} allows ${limit.requests} requests per ${limit.per}ms`
          });
        }
      });
    }
    
    // Apply this limit and continue to next
    return dynamicLimiterCache[cacheKey](req, res, () => applyNextLimit(req, res, next));
  };
  
  // Start applying limits
  applyNextLimit(req, res, next);
};

module.exports = {
  createRateLimiter,
  dynamicRateLimiter,
  parsePeriod
};