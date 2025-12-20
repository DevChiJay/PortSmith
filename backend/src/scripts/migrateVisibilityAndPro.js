require('dotenv').config();
const mongoose = require('mongoose');
const ApiCatalog = require('../models/ApiCatalog');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Migration script to:
 * 1. Set all existing APIs to visibility='public'
 * 2. Set all existing users to isPro=false
 */
async function migrate() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database for migration');

    // Update all existing APIs to have visibility='public'
    const apiResult = await ApiCatalog.updateMany(
      { visibility: { $exists: false } },
      { $set: { visibility: 'public' } }
    );
    logger.info(`Updated ${apiResult.modifiedCount} API(s) with default visibility='public'`);

    // Update all existing users to have isPro=false
    const userResult = await User.updateMany(
      { isPro: { $exists: false } },
      { $set: { isPro: false } }
    );
    logger.info(`Updated ${userResult.modifiedCount} user(s) with default isPro=false`);

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
