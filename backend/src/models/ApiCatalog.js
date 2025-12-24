const mongoose = require('mongoose');

const ApiCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  endpoints: [{
    path: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: 'GET'
    },
    description: String,
    requiresAuth: {
      type: Boolean,
      default: true
    }
  }],
  documentation: {
    type: String
  },
  // OpenAPI spec data (for APIs with OpenAPI)
  specData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Markdown documentation (for APIs without OpenAPI)
  markdown: {
    type: String,
    default: null
  },
  htmlDoc: {
    type: String,
    default: null
  },
  // Documentation mode: 'openapi' or 'markdown'
  mode: {
    type: String,
    enum: ['openapi', 'markdown'],
    default: 'openapi'
  },
  // External API source configuration
  externalSource: {
    liveUrl: String,
    docsUrl: String,
    pathPrefix: String,
    fallbackSpecFile: String,
    fallbackMarkdownUrl: String,
    lastSyncAt: Date,
    lastSyncStatus: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    },
    lastSyncError: String,
    specHash: String // To detect spec changes
  },
  // Display metadata
  icon: {
    type: String,
    default: '🔌'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  category: {
    type: String,
    default: 'General'
  },
  featured: {
    type: Boolean,
    default: false
  },
  pricing: {
    free: {
      maxRequests: Number,
      period: String
    },
    pro: {
      maxRequests: Number,
      period: String,
      price: Number
    }
  },
  authType: {
    type: String,
    enum: ['apiKey', 'oauth', 'basic', 'none'],
    default: 'apiKey'
  },
  defaultRateLimit: {
    requests: {
      type: Number,
      default: 100
    },
    per: {
      type: Number,
      default: 60 * 60 * 1000 // 1 hour in milliseconds
    }
  },
  gatewayConfig: {
    requiresAuth: {
      type: Boolean,
      default: true
    },
    rateLimit: {
      windowMs: {
        type: Number,
        default: 60 * 60 * 1000 // 1 hour in milliseconds
      },
      max: {
        type: Number,
        default: 100
      }
    },
    headers: {
      type: Map,
      of: String,
      default: {}
    },
    transformRequest: {
      type: String,
      default: null
    },
    transformResponse: {
      type: String,
      default: null
    },
    errorHandling: {
      type: Object,
      default: {}
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApiCatalog', ApiCatalogSchema);