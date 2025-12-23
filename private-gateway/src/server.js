require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Connect to MongoDB
connectDB();

// Define port
const PORT = process.env.PORT || 5002;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Private Gateway running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Gateway Type: ${process.env.GATEWAY_TYPE || 'private'}`);
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
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;
