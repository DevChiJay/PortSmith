// Load environment variables FIRST before anything else
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const cronScheduler = require('./services/cronSchedulerService');

// Connect to MongoDB
connectDB();

// Start cron scheduler for automatic spec syncing
if (process.env.ENABLE_AUTO_SYNC !== 'false') {
  logger.info('Starting cron scheduler for automatic spec syncing');
  cronScheduler.start();
} else {
  logger.info('Auto-sync disabled via ENABLE_AUTO_SYNC environment variable');
}

// Define port
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// For graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  cronScheduler.stop();
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;