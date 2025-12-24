# External API Sources Configuration

This directory contains the configuration for external FastAPI services whose OpenAPI specifications will be fetched, transformed, and integrated into PortSmith's API catalog.

## Overview

The external API sources configuration enables PortSmith to:

1. **Fetch OpenAPI specs** from external FastAPI services via `/openapi.json`
2. **Transform specs** to add PortSmith gateway routing, security, and metadata
3. **Store in database** for serving documentation to the frontend
4. **Support monorepo slicing** - create multiple API products from a single FastAPI codebase
5. **Fallback to Markdown** for APIs without OpenAPI specs

## Configuration File

**Location**: `backend/src/config/externalApiSources.js`

### Source Structure

Each API source can be configured as either:

#### 1. Single API Source

```javascript
{
  name: 'Weather API',                    // Display name
  slug: 'weather-api',                    // Unique identifier (URL-friendly)
  liveUrl: 'https://api.example.com',    // Base URL of the FastAPI service
  docsUrl: 'https://api.example.com/docs', // Swagger UI URL
  gatewayUrl: 'http://localhost:4000',   // PortSmith gateway base
  pathPrefix: '/gateway/weather',         // Gateway path prefix
  category: 'Data & Analytics',           // API category
  featured: true,                         // Show on featured list
  pricing: {                              // Pricing tiers
    free: { maxRequests: 100, period: '1 hour' },
    pro: { maxRequests: 10000, period: '1 hour', price: 29 }
  },
  rateLimit: {                            // Default rate limits
    windowMs: 60 * 60 * 1000,            // 1 hour
    max: 100
  },
  auth: {                                 // Auth for fetching spec
    type: 'header',
    header: 'X-API-KEY',
    value: process.env.WEATHER_API_KEY
  },
  fallbackSpecFile: './specs-cache/weather-api.json', // Local backup
  fallbackMarkdownUrl: null,              // Markdown fallback URL
  icon: '☀️',                             // Display icon
  color: '#FFA500',                       // Brand color
  visibility: 'public',                   // 'public' or 'private'
  enabled: true                           // Enable/disable source
}
```

#### 2. Monorepo Source (Multiple Products)

For a single FastAPI service that you want to split into multiple API products:

```javascript
{
  name: 'AI Services Suite',
  slug: 'ai-services',
  liveUrl: 'https://ai.example.com',
  fetchOnce: true,                        // Fetch spec once, slice multiple times
  products: [
    {
      name: 'Text Analysis API',
      slug: 'text-analysis',
      pathPrefix: '/gateway/text-analysis',
      category: 'AI & Machine Learning',
      tags: ['text', 'nlp', 'sentiment'], // Filter by FastAPI tags
      // ... other product config
    },
    {
      name: 'Image Processing API',
      slug: 'image-processing',
      pathPrefix: '/gateway/image-processing',
      pathPrefixes: ['/image', '/vision'], // Filter by path prefixes
      // ... other product config
    }
  ],
  // ... common config
}
```

#### 3. Markdown-Only Source

For APIs without OpenAPI specs:

```javascript
{
  name: 'Legacy Integration API',
  slug: 'legacy-api',
  liveUrl: null,
  mode: 'markdown',                       // Force markdown mode
  fallbackMarkdownUrl: 'https://docs.example.com/api.md',
  // ... other config
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Gateway base URL
GATEWAY_BASE_URL=http://localhost:4000

# API keys for fetching external specs (optional)
WEATHER_API_KEY=your_api_key_here
AI_SERVICES_API_KEY=your_api_key_here
```

## CLI Usage

The configuration includes a CLI tool for managing and validating sources:

```bash
# List all configured sources
node src/scripts/apiSourcesCli.js list

# List all products (including monorepo slices)
node src/scripts/apiSourcesCli.js products

# Validate all configurations
node src/scripts/apiSourcesCli.js validate

# Show configuration summary
node src/scripts/apiSourcesCli.js summary

# Show details for a specific source
node src/scripts/apiSourcesCli.js show weather-api

# Show help
node src/scripts/apiSourcesCli.js help
```

## Service Usage

Use the `ExternalApiSourceService` in your code:

```javascript
const externalApiSourceService = require('./services/externalApiSourceService');

// Get all enabled sources
const sources = externalApiSourceService.getActiveSources();

// Get all products (including slices)
const products = externalApiSourceService.getProducts();

// Get a specific source
const source = externalApiSourceService.getSource('weather-api');

// Get featured products
const featured = externalApiSourceService.getFeaturedProducts();

// Get products by category
const aiApis = externalApiSourceService.getProductsByCategory('AI & Machine Learning');

// Validate configuration
const validation = externalApiSourceService.validateAllSources();
if (validation.invalid > 0) {
  console.error('Invalid configurations:', validation.errors);
}

// Show summary
externalApiSourceService.logSummary();
```

## Configuration Fields Reference

### Required Fields

- `name` - Display name of the API
- `slug` - Unique URL-friendly identifier
- `gatewayUrl` - PortSmith gateway base URL
- `pathPrefix` - Gateway path prefix (e.g., `/gateway/weather`)

### Optional Fields

- `liveUrl` - Base URL of the FastAPI service (required for OpenAPI mode)
- `docsUrl` - Swagger UI documentation URL
- `category` - API category for grouping
- `featured` - Whether to show in featured list (boolean)
- `icon` - Display icon (emoji or icon name)
- `color` - Brand color (hex code)
- `visibility` - `'public'` or `'private'`
- `mode` - `'openapi'` or `'markdown'`
- `enabled` - Enable/disable this source (boolean)

### Pricing Configuration

```javascript
pricing: {
  free: {
    maxRequests: 100,      // Max requests
    period: '1 hour'       // Time period (human-readable)
  },
  pro: {
    maxRequests: 10000,
    period: '1 hour',
    price: 29              // Monthly price in USD
  }
}
```

### Rate Limiting

```javascript
rateLimit: {
  windowMs: 60 * 60 * 1000,  // Time window in milliseconds
  max: 100                    // Max requests per window
}
```

### Authentication (for fetching specs)

```javascript
auth: {
  type: 'header',           // 'header', 'query', 'basic'
  header: 'X-API-KEY',      // Header name
  value: process.env.API_KEY // API key value
}
```

### Fallback Options

- `fallbackSpecFile` - Path to local OpenAPI spec backup (e.g., `'./specs-cache/weather-api.json'`)
- `fallbackMarkdownUrl` - URL to Markdown documentation (for markdown mode)

### Monorepo Slicing

For sources with `fetchOnce: true` and `products` array:

**Filter by Tags**:
```javascript
tags: ['text', 'nlp', 'sentiment']  // Include operations with these tags
```

**Filter by Path Prefixes**:
```javascript
pathPrefixes: ['/image', '/vision']  // Include paths starting with these prefixes
```

## Database Schema

The `ApiCatalog` model has been extended with these fields:

- `specData` - Transformed OpenAPI spec (object)
- `markdown` - Raw Markdown content (string)
- `htmlDoc` - Rendered HTML from Markdown (string)
- `mode` - Documentation mode: `'openapi'` or `'markdown'`
- `externalSource` - External source metadata:
  - `liveUrl` - Source API base URL
  - `docsUrl` - Source documentation URL
  - `pathPrefix` - Gateway path prefix
  - `fallbackSpecFile` - Fallback spec file path
  - `fallbackMarkdownUrl` - Fallback Markdown URL
  - `lastSyncAt` - Last successful sync timestamp
  - `lastSyncStatus` - `'success'`, `'failed'`, or `'pending'`
  - `lastSyncError` - Error message if sync failed
  - `specHash` - Hash of spec for change detection
- `icon` - Display icon
- `color` - Brand color
- `category` - API category
- `featured` - Featured flag
- `pricing` - Pricing tiers

## Next Steps

1. **Configure your APIs** - Edit `externalApiSources.js` and set `enabled: true`
2. **Set environment variables** - Add API keys to `.env` if needed
3. **Validate configuration** - Run `node src/scripts/apiSourcesCli.js validate`
4. **Proceed to Phase 2** - Implement spec fetching and transformation

## Examples in Config

The configuration file includes three example sources:

1. **Weather API** - Single API source with OpenAPI spec
2. **AI Services Suite** - Monorepo with multiple product slices
3. **Legacy Integration API** - Markdown-only documentation

These are disabled by default (`enabled: false`). Edit them or create your own configurations.
