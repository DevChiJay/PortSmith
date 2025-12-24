/**
 * Spec Sync Orchestrator Service
 * 
 * Orchestrates fetching, subsetting, and caching of OpenAPI specs
 * from external API sources
 */

const specFetcherService = require('./specFetcherService');
const specSubsetService = require('./specSubsetService');
const externalApiSourceService = require('./externalApiSourceService');
const logger = require('../utils/logger');

class SpecSyncService {
  /**
   * Sync a single API source (fetch and cache)
   * @param {String} slug - API source slug
   * @param {String} mode - 'live', 'fallback', or 'hybrid'
   * @returns {Promise<Object>} Sync result
   */
  async syncSource(slug, mode = 'hybrid') {
    const source = externalApiSourceService.getSource(slug);
    
    if (!source) {
      return {
        slug,
        success: false,
        error: `Source not found: ${slug}`,
        timestamp: new Date()
      };
    }

    logger.info(`🔄 Syncing source: ${source.name} (${slug})`);

    try {
      // Fetch the spec
      const fetchResult = await specFetcherService.fetchSpec(source, mode);
      
      if (!fetchResult.success) {
        return {
          slug,
          success: false,
          error: fetchResult.error,
          source: fetchResult.source,
          timestamp: new Date()
        };
      }

      const rawSpec = fetchResult.spec;

      // Check if spec has changed
      const hasChanged = await specFetcherService.hasSpecChanged(slug, rawSpec);
      
      if (!hasChanged) {
        logger.info(`ℹ️  Spec for ${slug} unchanged, skipping cache update`);
      } else {
        // Cache the raw spec
        await specFetcherService.cacheSpec(slug, rawSpec);
        logger.info(`💾 Cached spec for ${slug}`);
      }

      // Calculate spec hash
      const specHash = specFetcherService.calculateSpecHash(rawSpec);

      // Get spec stats
      const stats = specSubsetService.getSpecStats(rawSpec);

      return {
        slug,
        success: true,
        source: fetchResult.source,
        hasChanged,
        specHash,
        stats,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error(`Error syncing source ${slug}:`, error);
      
      return {
        slug,
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Sync a monorepo source and create product slices
   * @param {String} parentSlug - Parent monorepo source slug
   * @param {String} mode - 'live', 'fallback', or 'hybrid'
   * @returns {Promise<Object>} Sync results for all products
   */
  async syncMonorepoSource(parentSlug, mode = 'hybrid') {
    const source = externalApiSourceService.getSource(parentSlug);
    
    if (!source) {
      return {
        parentSlug,
        success: false,
        error: `Source not found: ${parentSlug}`,
        products: [],
        timestamp: new Date()
      };
    }

    if (!source.fetchOnce || !source.products || source.products.length === 0) {
      return {
        parentSlug,
        success: false,
        error: 'Source is not configured as a monorepo with products',
        products: [],
        timestamp: new Date()
      };
    }

    logger.info(`🔄 Syncing monorepo source: ${source.name} (${parentSlug})`);

    try {
      // Fetch the raw spec once
      const fetchResult = await specFetcherService.fetchSpec(source, mode);
      
      if (!fetchResult.success) {
        return {
          parentSlug,
          success: false,
          error: fetchResult.error,
          source: fetchResult.source,
          products: [],
          timestamp: new Date()
        };
      }

      const rawSpec = fetchResult.spec;

      // Cache the parent spec
      await specFetcherService.cacheSpec(parentSlug, rawSpec);
      logger.info(`💾 Cached parent spec for ${parentSlug}`);

      // Get available tags and prefixes for reference
      const availableTags = specSubsetService.getAllTags(rawSpec);
      const availablePrefixes = specSubsetService.getAllPathPrefixes(rawSpec);
      
      logger.info(`Available tags: ${availableTags.join(', ')}`);
      logger.info(`Available path prefixes: ${availablePrefixes.join(', ')}`);

      // Create subset specs for each product
      const productResults = [];

      for (const product of source.products) {
        try {
          logger.info(`  📦 Creating subset for product: ${product.name} (${product.slug})`);

          // Create subset spec
          const subsetSpec = specSubsetService.subsetSpec(rawSpec, {
            tags: product.tags,
            pathPrefixes: product.pathPrefixes,
            name: product.name,
            slug: product.slug
          });

          // Check if subset has changed
          const hasChanged = await specFetcherService.hasSpecChanged(product.slug, subsetSpec);
          
          if (!hasChanged) {
            logger.info(`  ℹ️  Subset for ${product.slug} unchanged`);
          } else {
            // Cache the subset spec
            await specFetcherService.cacheSpec(product.slug, subsetSpec);
            logger.info(`  💾 Cached subset for ${product.slug}`);
          }

          // Calculate hash and stats
          const specHash = specFetcherService.calculateSpecHash(subsetSpec);
          const stats = specSubsetService.getSpecStats(subsetSpec);

          productResults.push({
            slug: product.slug,
            name: product.name,
            success: true,
            hasChanged,
            specHash,
            stats
          });

        } catch (productError) {
          logger.error(`  ❌ Error creating subset for ${product.slug}:`, productError);
          
          productResults.push({
            slug: product.slug,
            name: product.name,
            success: false,
            error: productError.message
          });
        }
      }

      const successCount = productResults.filter(p => p.success).length;
      const totalCount = productResults.length;

      return {
        parentSlug,
        success: true,
        source: fetchResult.source,
        products: productResults,
        summary: `${successCount}/${totalCount} products synced successfully`,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error(`Error syncing monorepo source ${parentSlug}:`, error);
      
      return {
        parentSlug,
        success: false,
        error: error.message,
        products: [],
        timestamp: new Date()
      };
    }
  }

  /**
   * Sync all enabled sources
   * @param {String} mode - 'live', 'fallback', or 'hybrid'
   * @returns {Promise<Object>} Summary of sync results
   */
  async syncAll(mode = 'hybrid') {
    logger.info(`\n🚀 Starting sync for all enabled sources (${mode} mode)\n`);

    const sources = externalApiSourceService.getActiveSources();
    
    if (sources.length === 0) {
      logger.warn('No enabled sources found. Enable sources in externalApiSources.js');
      return {
        success: true,
        totalSources: 0,
        synced: 0,
        failed: 0,
        results: [],
        timestamp: new Date()
      };
    }

    const results = [];
    let syncedCount = 0;
    let failedCount = 0;

    // Ensure cache directory exists
    await specFetcherService.ensureCacheDirectory();

    for (const source of sources) {
      try {
        let result;

        // Check if this is a monorepo source
        if (source.fetchOnce && source.products && source.products.length > 0) {
          result = await this.syncMonorepoSource(source.slug, mode);
          
          if (result.success) {
            // Count product successes
            const productSuccesses = result.products.filter(p => p.success).length;
            syncedCount += productSuccesses;
            failedCount += result.products.length - productSuccesses;
          } else {
            failedCount++;
          }
        } else {
          result = await this.syncSource(source.slug, mode);
          
          if (result.success) {
            syncedCount++;
          } else {
            failedCount++;
          }
        }

        results.push(result);

      } catch (error) {
        logger.error(`Unexpected error syncing ${source.slug}:`, error);
        failedCount++;
        
        results.push({
          slug: source.slug,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    const summary = {
      success: failedCount === 0,
      totalSources: sources.length,
      synced: syncedCount,
      failed: failedCount,
      results,
      timestamp: new Date()
    };

    logger.info(`\n✅ Sync complete: ${syncedCount} synced, ${failedCount} failed\n`);

    return summary;
  }

  /**
   * Get sync status for a specific source
   * @param {String} slug - API source slug
   * @returns {Promise<Object>} Status information
   */
  async getSourceStatus(slug) {
    const source = externalApiSourceService.getSource(slug);
    
    if (!source) {
      return { found: false, slug };
    }

    // Check if cached spec exists
    const cachedSpec = await specFetcherService.loadCachedSpec(slug);
    const hasCachedSpec = cachedSpec !== null;
    
    let cachedSpecHash = null;
    let cachedSpecStats = null;

    if (hasCachedSpec) {
      cachedSpecHash = specFetcherService.calculateSpecHash(cachedSpec);
      cachedSpecStats = specSubsetService.getSpecStats(cachedSpec);
    }

    return {
      found: true,
      slug,
      name: source.name,
      enabled: source.enabled,
      mode: source.mode || 'openapi',
      hasCachedSpec,
      cachedSpecHash,
      cachedSpecStats,
      liveUrl: source.liveUrl,
      fallbackSpecFile: source.fallbackSpecFile
    };
  }
}

module.exports = new SpecSyncService();
