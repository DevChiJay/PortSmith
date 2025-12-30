/**
 * External API Sources Configuration
 * 
 * This file defines external FastAPI services whose OpenAPI specs will be
 * fetched, transformed, and stored in the API catalog for documentation.
 * 
 * Each source can represent either:
 * 1. A single API with its own spec
 * 2. A monorepo FastAPI with multiple product slices (using tags or pathPrefixes)
 */

const externalApiSources = [
  // Example 1: Single FastAPI service
  {
    name: 'Weather API',
    slug: 'weather-api',
    liveUrl: 'https://weather-api.example.com',
    docsUrl: 'https://weather-api.example.com/docs',
    gatewayUrl: process.env.GATEWAY_BASE_URL || 'http://localhost:4000',
    pathPrefix: '/gateway/weather',
    category: 'Data & Analytics',
    featured: true,
    pricing: {
      free: {
        maxRequests: 100,
        period: '1 hour'
      },
      pro: {
        maxRequests: 10000,
        period: '1 hour',
        price: 29
      }
    },
    rateLimit: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100
    },
    auth: {
      type: 'header',
      header: 'X-API-KEY',
      value: process.env.WEATHER_API_KEY || null
    },
    fallbackSpecFile: './specs-examples/weather-api.json',
    fallbackMarkdownUrl: null,
    icon: '☀️',
    color: '#FFA500',
    visibility: 'public',
    enabled: false // Enabled for testing
  },

  // Example 2: Monorepo FastAPI with multiple products
  {
    name: 'API HQ Suite',
    slug: 'api-hq-services', // Parent slug for the monorepo
    liveUrl: 'http://localhost:8000',
    docsUrl: 'http://localhost:8000/docs',
    gatewayUrl: process.env.GATEWAY_BASE_URL || 'http://localhost:5001',
    pathPrefix: '/gateway/api-hq', // Parent path prefix (not used directly, but required for validation)
    // This will be fetched once and sliced into multiple products
    fetchOnce: true,
    products: [
      {
        name: 'Contact Form API',
        slug: 'contact-us',
        pathPrefix: '/gateway/contact-us',
        category: 'General',
        featured: true,
        pricing: {
          free: { maxRequests: 10, period: '1 hour' },
          pro: { maxRequests: 100, period: '1 hour', price: 49 }
        },
        rateLimit: { windowMs: 60 * 60 * 1000, max: 10 },
        icon: '📩',
        color: '#4A90E2',
        visibility: 'public',
        // Filter by tags (FastAPI tags) - must match FastAPI tag casing
        tags: ['Contact']
      },
      {
        name: 'Email Sorter API',
        slug: 'email-sorter',
        pathPrefix: '/gateway/email-sorter',
        category: 'General',
        featured: true,
        pricing: {
          free: { maxRequests: 10, period: '1 hour' },
          pro: { maxRequests: 100, period: '1 hour', price: 49 }
        },
        rateLimit: { windowMs: 60 * 60 * 1000, max: 10 },
        icon: '📧',
        color: '#4A90E2',
        visibility: 'public',
        // Filter by tags (FastAPI tags) - must match FastAPI tag casing
        tags: ['Email Sorter']
      },
      {
        name: 'AI Summarizer',
        slug: 'summarizer',
        pathPrefix: '/gateway/summarizer',
        category: 'AI Integration',
        featured: true,
        pricing: {
          free: { maxRequests: 10, period: '1 day' },
          pro: { maxRequests: 100, period: '1 day', price: 49 }
        },
        rateLimit: { windowMs: 24 * 60 * 60 * 1000, max: 10 },
        icon: '🤖',
        color: '#4A90E2',
        visibility: 'public',
        // Filter by tags (FastAPI tags) - must match FastAPI tag casing
        tags: ['AI Summarizer']
      },
      {
        name: 'Voice Bot AI',
        slug: 'voice-bot',
        pathPrefix: '/gateway/voice-bot',
        category: 'AI Integration',
        featured: true,
        pricing: {
          free: { maxRequests: 1, period: '1 day' },
          pro: { maxRequests: 20, period: '1 day', price: 49 }
        },
        rateLimit: { windowMs: 24 * 60 * 60 * 1000, max: 10 },
        icon: '🔉',
        color: '#4A90E2',
        visibility: 'public',
        // Filter by tags (FastAPI tags) - must match FastAPI tag casing
        tags: ['Voice Bot']
      }
    ],
    auth: {
      type: 'header',
      header: 'X-API-KEY',
      value: process.env.AI_SERVICES_API_KEY || null
    },
    fallbackSpecFile: './specs-examples/ai-services.json',
    fallbackMarkdownUrl: null,
    enabled: true // Enabled for testing
  },

  // Example 3: API without OpenAPI spec (Markdown only)
  {
    name: 'Legacy Integration API',
    slug: 'legacy-api',
    liveUrl: null, // No OpenAPI endpoint
    docsUrl: 'https://docs.legacy-api.example.com',
    gatewayUrl: process.env.GATEWAY_BASE_URL || 'http://localhost:4000',
    pathPrefix: '/gateway/legacy',
    category: 'Integration',
    featured: false,
    pricing: {
      free: { maxRequests: 50, period: '1 hour' }
    },
    rateLimit: {
      windowMs: 60 * 60 * 1000,
      max: 50
    },
    auth: null,
    fallbackSpecFile: null,
    fallbackMarkdownUrl: 'https://docs.legacy-api.example.com/api-reference.md',
    icon: '⚙️',
    color: '#95A5A6',
    visibility: 'public',
    mode: 'markdown', // Force markdown mode
    enabled: false
  }
];

/**
 * Get all enabled API sources
 * @returns {Array} Array of enabled API source configurations
 */
function getEnabledSources() {
  return externalApiSources.filter(source => source.enabled);
}

/**
 * Get a specific API source by slug
 * @param {String} slug - The API slug
 * @returns {Object|null} The API source configuration or null
 */
function getSourceBySlug(slug) {
  return externalApiSources.find(source => source.slug === slug) || null;
}

/**
 * Get all product slices from monorepo sources
 * @returns {Array} Array of product configurations with parent source info
 */
function getAllProducts() {
  const products = [];
  
  externalApiSources.forEach(source => {
    if (source.products && Array.isArray(source.products)) {
      source.products.forEach(product => {
        products.push({
          ...product,
          parentSlug: source.slug,
          parentLiveUrl: source.liveUrl,
          parentAuth: source.auth,
          parentFallbackSpecFile: source.fallbackSpecFile
        });
      });
    } else {
      // Single API source (not a monorepo)
      products.push(source);
    }
  });
  
  return products.filter(p => {
    // Check if parent source is enabled (for products)
    if (p.parentSlug) {
      const parent = externalApiSources.find(s => s.slug === p.parentSlug);
      return parent && parent.enabled;
    }
    // For standalone sources, check their own enabled flag
    return p.enabled !== false;
  });
}

/**
 * Validate API source configuration
 * @param {Object} source - API source configuration
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateSource(source) {
  const errors = [];
  
  if (!source.name) errors.push('Name is required');
  if (!source.slug) errors.push('Slug is required');
  if (!source.gatewayUrl) errors.push('Gateway URL is required');
  if (!source.pathPrefix) errors.push('Path prefix is required');
  
  if (source.mode !== 'markdown' && !source.liveUrl && !source.fallbackSpecFile) {
    errors.push('Either liveUrl or fallbackSpecFile must be provided for OpenAPI mode');
  }
  
  if (source.mode === 'markdown' && !source.fallbackMarkdownUrl) {
    errors.push('fallbackMarkdownUrl is required for markdown mode');
  }
  
  if (source.products && !source.fetchOnce) {
    errors.push('fetchOnce must be true for sources with multiple products');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  externalApiSources,
  getEnabledSources,
  getSourceBySlug,
  getAllProducts,
  validateSource
};
