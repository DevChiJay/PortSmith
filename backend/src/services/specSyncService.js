/**
 * Spec Sync Orchestrator Service
 * 
 * Orchestrates fetching, subsetting, and caching of OpenAPI specs
 * from external API sources
 */

const specFetcherService = require('./specFetcherService');
const specSubsetService = require('./specSubsetService');
const specTransformService = require('./specTransformService');
const markdownService = require('./markdownService');
const apiCatalogPersistenceService = require('./apiCatalogPersistenceService');
const externalApiSourceService = require('./externalApiSourceService');
const logger = require('../utils/logger');

class SpecSyncService {
  /**
   * Sync a single API source (fetch, transform, and persist)
   * @param {String} slug - API source slug
   * @param {String} mode - 'live', 'fallback', or 'hybrid'
   * @param {Boolean} persistToDb - Whether to save to MongoDB
   * @returns {Promise<Object>} Sync result
   */
  async syncSource(slug, mode = 'hybrid', persistToDb = true) {
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
      // Handle markdown-only sources
      if (source.mode === 'markdown') {
        return await this._syncMarkdownSource(source, persistToDb);
      }

      // Fetch the spec
      const fetchResult = await specFetcherService.fetchSpec(source, mode);
      
      if (!fetchResult.success) {
        await apiCatalogPersistenceService.updateSyncStatus(slug, {
          success: false,
          error: fetchResult.error,
          timestamp: new Date()
        });

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
      
      // Check if API exists in database
      const existingApi = await apiCatalogPersistenceService.getApiCatalog(slug);
      const shouldPersist = persistToDb && (hasChanged || !existingApi);
      
      if (!hasChanged) {
        logger.info(`ℹ️  Spec for ${slug} unchanged${!existingApi ? ', but not in database yet' : ', skipping update'}`);
      } else {
        // Cache the raw spec
        await specFetcherService.cacheSpec(slug, rawSpec);
        logger.info(`💾 Cached spec for ${slug}`);
      }

      // Transform the spec
      const transformedSpec = specTransformService.transformSpec(rawSpec, source);

      // Derive endpoints
      const endpoints = specTransformService.deriveEndpoints(transformedSpec);

      // Calculate spec hash
      const specHash = specFetcherService.calculateSpecHash(rawSpec);

      // Get spec stats
      const stats = specSubsetService.getSpecStats(rawSpec);

      // Persist to database
      if (shouldPersist) {
        await apiCatalogPersistenceService.saveOpenApiCatalog(
          source,
          transformedSpec,
          endpoints,
          { success: true, specHash, timestamp: new Date() }
        );
        logger.info(`💾 Saved to database: ${slug}`);
      }

      return {
        slug,
        success: true,
        source: fetchResult.source,
        hasChanged,
        specHash,
        stats,
        endpointCount: endpoints.length,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error(`Error syncing source ${slug}:`, error);
      
      await apiCatalogPersistenceService.updateSyncStatus(slug, {
        success: false,
        error: error.message,
        timestamp: new Date()
      });

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
   * @param {Boolean} persistToDb - Whether to save to MongoDB
   * @returns {Promise<Object>} Sync results for all products
   */
  async syncMonorepoSource(parentSlug, mode = 'hybrid', persistToDb = true) {
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

          // Merge product config with parent config
          const productConfig = {
            ...product,
            liveUrl: source.liveUrl,
            docsUrl: source.docsUrl,
            gatewayUrl: product.gatewayUrl || source.gatewayUrl,
            fallbackSpecFile: source.fallbackSpecFile
          };

          // Create subset spec
          const subsetSpec = specSubsetService.subsetSpec(rawSpec, {
            tags: product.tags,
            pathPrefixes: product.pathPrefixes,
            name: product.name,
            slug: product.slug
          });

          // Transform the subset
          const transformedSpec = specTransformService.transformSpec(subsetSpec, productConfig);

          // Derive endpoints
          const endpoints = specTransformService.deriveEndpoints(transformedSpec);

          // Check if subset has changed
          const hasChanged = await specFetcherService.hasSpecChanged(product.slug, subsetSpec);
          
          // Check if product exists in database
          const existingProduct = await apiCatalogPersistenceService.getApiCatalog(product.slug);
          const shouldPersist = persistToDb && (hasChanged || !existingProduct);
          
          if (!hasChanged) {
            logger.info(`  ℹ️  Subset for ${product.slug} unchanged${!existingProduct ? ', but not in database yet' : ''}`);
          } else {
            // Cache the subset spec
            await specFetcherService.cacheSpec(product.slug, subsetSpec);
            logger.info(`  💾 Cached subset for ${product.slug}`);
          }

          // Calculate hash and stats
          const specHash = specFetcherService.calculateSpecHash(subsetSpec);
          const stats = specSubsetService.getSpecStats(subsetSpec);

          // Persist to database
          if (shouldPersist) {
            await apiCatalogPersistenceService.saveOpenApiCatalog(
              productConfig,
              transformedSpec,
              endpoints,
              { success: true, specHash, timestamp: new Date() }
            );
            logger.info(`  💾 Saved product to database: ${product.slug}`);
          }

          productResults.push({
            slug: product.slug,
            name: product.name,
            success: true,
            hasChanged,
            specHash,
            stats,
            endpointCount: endpoints.length
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
   * @param {Boolean} persistToDb - Whether to save to MongoDB
   * @returns {Promise<Object>} Summary of sync results
   */
  async syncAll(mode = 'hybrid', persistToDb = true) {
    logger.info(`\n🚀 Starting sync for all enabled sources (${mode} mode, persist: ${persistToDb})\n`);

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
          result = await this.syncMonorepoSource(source.slug, mode, persistToDb);
          
          if (result.success) {
            // Count product successes
            const productSuccesses = result.products.filter(p => p.success).length;
            syncedCount += productSuccesses;
            failedCount += result.products.length - productSuccesses;
          } else {
            failedCount++;
          }
        } else {
          result = await this.syncSource(source.slug, mode, persistToDb);
          
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
   * Sync a markdown-only source
   * @private
   */
  async _syncMarkdownSource(source, persistToDb) {
    const { slug, fallbackMarkdownUrl } = source;

    logger.info(`📄 Syncing markdown source: ${source.name} (${slug})`);

    try {
      // Fetch or load markdown
      let markdownResult;
      
      if (fallbackMarkdownUrl && fallbackMarkdownUrl.startsWith('http')) {
        markdownResult = await markdownService.fetchMarkdown(fallbackMarkdownUrl);
      } else if (fallbackMarkdownUrl) {
        markdownResult = await markdownService.loadMarkdownFile(fallbackMarkdownUrl);
      } else {
        throw new Error('No markdown URL or file configured');
      }

      if (!markdownResult.success) {
        return {
          slug,
          success: false,
          error: markdownResult.error,
          source: 'markdown-failed',
          timestamp: new Date()
        };
      }

      const markdown = markdownResult.markdown;

      // Render to HTML
      const htmlDoc = markdownService.renderToHtml(markdown, {
        includeToc: true,
        codeTheme: 'dark',
        title: source.name
      });

      // Calculate hash
      const markdownHash = markdownService.calculateMarkdownHash(markdown);

      // Persist to database
      if (persistToDb) {
        await apiCatalogPersistenceService.saveMarkdownCatalog(
          source,
          markdown,
          htmlDoc,
          markdownHash
        );
        logger.info(`💾 Saved markdown to database: ${slug}`);
      }

      return {
        slug,
        success: true,
        source: 'markdown',
        markdownHash,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error(`Error syncing markdown source ${slug}:`, error);

      return {
        slug,
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
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
