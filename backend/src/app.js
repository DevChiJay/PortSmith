const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const logger = require('./utils/logger');
const passport = require('./config/passport');

// Route imports
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/apis');
const keyRoutes = require('./routes/keys');
const gatewayRoutes = require('./routes/gateway');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// Create Express app
const app = express();

// Security middleware with relaxed CSP for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", process.env.FRONTEND_URL || 'http://localhost:3000'],
    },
  },
}));

// Enable CORS with credentials support
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Request logging
app.use(logger.httpLogger);

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport for OAuth authentication
app.use(passport.initialize());

// Serve static files from uploads directory with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Note: JWT authentication is handled by requireAuth middleware in individual routes
// No global authentication middleware needed

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/gateway', gatewayRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'API Key Management Platform',
    documentation: '/api/docs',
    version: '1.0.0'
  });
});

// Basic documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'API Key Management Platform Documentation',
    endpoints: {
      auth: {
        'GET /api/auth/me': 'Get current user profile (requires auth)'
      },
      user: {
        'GET /api/user/metrics/overview': 'Get user dashboard overview metrics (requires auth)',
        'GET /api/user/metrics/timeline': 'Get user request timeline for last 30 days (requires auth)',
        'GET /api/user/notifications': 'Get user notifications (requires auth)',
        'GET /api/user/profile': 'Get user profile (requires auth)',
        'PUT /api/user/profile': 'Update user profile (requires auth)'
      },
      apis: {
        'GET /api/apis': 'Get all available APIs',
        'GET /api/apis/featured': 'Get 6 featured APIs',
        'GET /api/apis/:idOrSlug': 'Get details for a specific API',
        'POST /api/apis': 'Add a new API (requires admin auth)',
        'PUT /api/apis/:id': 'Update an API (requires admin auth)',
        'DELETE /api/apis/:id': 'Deactivate an API (requires admin auth)'
      },
      keys: {
        'GET /api/keys': 'Get all your API keys with usage stats (requires auth)',
        'GET /api/keys/:id': 'Get a specific API key (requires auth)',
        'POST /api/keys': 'Generate a new API key (requires auth)',
        'PUT /api/keys/:id': 'Update an API key (requires auth)',
        'POST /api/keys/:id/revoke': 'Revoke an API key (requires auth)',
        'GET /api/keys/:id/metrics': 'Get usage metrics for a key (requires auth)'
      },
      admin: {
        'GET /api/admin/analytics/overview': 'Get admin overview analytics (requires admin auth)',
        'GET /api/admin/analytics/users': 'Get paginated user list with analytics (requires admin auth)',
        'GET /api/admin/analytics/apis': 'Get API usage statistics (requires admin auth)',
        'GET /api/admin/analytics/activity': 'Get recent activity log (requires admin auth)',
        'GET /api/admin/users/:id': 'Get user details by ID (requires admin auth)',
        'PUT /api/admin/users/:id': 'Update user details (requires admin auth)',
        'DELETE /api/admin/users/:id': 'Delete user (requires admin auth)'
      },
      gateway: {
        'ALL /:apiName/*': 'Make requests to external APIs (requires API key)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

module.exports = app;