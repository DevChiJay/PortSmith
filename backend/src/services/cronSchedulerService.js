/**
 * Cron Scheduler Service
 * 
 * Schedules periodic sync of external API sources
 */

const cron = require('node-cron');
const specSyncService = require('./specSyncService');
const logger = require('../utils/logger');

class CronSchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Cron scheduler is already running');
      return;
    }

    // Daily sync at 3:00 AM (hybrid mode)
    this.scheduleDaily();

    // Optional: Weekly full sync at Sunday 2:00 AM (live mode)
    this.scheduleWeekly();

    this.isRunning = true;
    logger.info('✅ Cron scheduler started');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    logger.info('Cron scheduler stopped');
  }

  /**
   * Schedule daily sync at 3:00 AM (hybrid mode)
   */
  scheduleDaily() {
    const jobName = 'daily-sync';
    
    // Cron expression: 0 3 * * * = Every day at 3:00 AM
    const schedule = '0 3 * * *';
    
    const job = cron.schedule(schedule, async () => {
      logger.info(`\n🕐 Running scheduled daily sync (${new Date().toISOString()})\n`);
      
      try {
        const result = await specSyncService.syncAll('hybrid', true);
        
        logger.info(`Daily sync completed: ${result.synced} synced, ${result.failed} failed`);
        
        if (result.failed > 0) {
          logger.warn(`Daily sync had ${result.failed} failures - check logs for details`);
        }
      } catch (error) {
        logger.error('Daily sync failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set(jobName, job);
    logger.info(`Scheduled ${jobName}: ${schedule} UTC`);
  }

  /**
   * Schedule weekly sync at Sunday 2:00 AM (live mode)
   */
  scheduleWeekly() {
    const jobName = 'weekly-sync';
    
    // Cron expression: 0 2 * * 0 = Every Sunday at 2:00 AM
    const schedule = '0 2 * * 0';
    
    const job = cron.schedule(schedule, async () => {
      logger.info(`\n🕐 Running scheduled weekly sync (${new Date().toISOString()})\n`);
      
      try {
        const result = await specSyncService.syncAll('live', true);
        
        logger.info(`Weekly sync completed: ${result.synced} synced, ${result.failed} failed`);
        
        if (result.failed > 0) {
          logger.warn(`Weekly sync had ${result.failed} failures - check logs for details`);
        }
      } catch (error) {
        logger.error('Weekly sync failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set(jobName, job);
    logger.info(`Scheduled ${jobName}: ${schedule} UTC`);
  }

  /**
   * Run sync immediately (manual trigger)
   * @param {String} mode - Sync mode
   * @returns {Promise<Object>} Sync result
   */
  async runSyncNow(mode = 'hybrid') {
    logger.info(`Running manual sync (mode: ${mode})`);
    
    try {
      const result = await specSyncService.syncAll(mode, true);
      logger.info(`Manual sync completed: ${result.synced} synced, ${result.failed} failed`);
      return result;
    } catch (error) {
      logger.error('Manual sync failed:', error);
      throw error;
    }
  }

  /**
   * Get status of all scheduled jobs
   * @returns {Array} Array of job statuses
   */
  getJobsStatus() {
    const statuses = [];
    
    this.jobs.forEach((job, name) => {
      statuses.push({
        name,
        running: this.isRunning
      });
    });
    
    return statuses;
  }
}

module.exports = new CronSchedulerService();
