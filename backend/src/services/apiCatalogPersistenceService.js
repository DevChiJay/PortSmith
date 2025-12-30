/**
 * API Catalog Persistence Service
 * 
 * Handles saving and updating API catalog entries in MongoDB
 * with transformed specs, endpoints, and metadata
 */

const ApiCatalog = require('../models/ApiCatalog');
const logger = require('../utils/logger');

class ApiCatalogPersistenceService {
  /**
   * Upsert (create or update) an API catalog entry
   * @param {Object} data - API catalog data
   * @returns {Promise<Object>} Saved catalog entry
   */
  async upsertApiCatalog(data) {
    const {
      slug,
      name,
      description,
      category,
      baseUrl,
      documentation,
      specData,
      markdown,
      htmlDoc,
      mode,
      endpoints,
      featured,
      pricing,
      rateLimit,
      icon,
      color,
      visibility,
      externalSource
    } = data;

    try {
      logger.info(`Upserting API catalog entry for ${slug}`);

      const catalogEntry = await ApiCatalog.findOneAndUpdate(
        { slug },
        {
          $set: {
            name,
            description,
            category,
            baseUrl,
            documentation,
            mode: mode || 'openapi',
            featured: featured || false,
            icon: icon || '🔌',
            color: color || '#3B82F6',
            visibility: visibility || 'public',
            updatedAt: new Date(),
            ...(specData && { specData }),
            ...(markdown && { markdown }),
            ...(htmlDoc && { htmlDoc }),
            ...(endpoints && { endpoints }),
            ...(pricing && { pricing }),
            ...(rateLimit && { 
              defaultRateLimit: {
                requests: rateLimit.max || 100,
                per: rateLimit.windowMs || 3600000
              }
            }),
            ...(externalSource && { externalSource })
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      logger.info(`✅ Successfully upserted API catalog entry for ${slug}`);

      return catalogEntry;

    } catch (error) {
      logger.error(`Failed to upsert API catalog for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Save OpenAPI-based API to catalog
   * @param {Object} config - Source configuration
   * @param {Object} transformedSpec - Transformed OpenAPI spec
   * @param {Array} endpoints - Derived endpoints
   * @param {Object} syncResult - Sync metadata
   * @returns {Promise<Object>} Saved catalog entry
   */
  async saveOpenApiCatalog(config, transformedSpec, endpoints, syncResult) {
    const metadata = {
      name: config.name,
      slug: config.slug,
      description: config.description || transformedSpec.info?.description || '',
      category: config.category || 'General',
      baseUrl: config.liveUrl,
      documentation: config.docsUrl,
      specData: transformedSpec,
      mode: 'openapi',
      endpoints,
      featured: config.featured || false,
      pricing: config.pricing,
      rateLimit: config.rateLimit,
      icon: config.icon || '🔌',
      color: config.color || '#3B82F6',
      visibility: config.visibility || 'public',
      externalSource: {
        liveUrl: config.liveUrl,
        docsUrl: config.docsUrl,
        pathPrefix: config.pathPrefix,
        fallbackSpecFile: config.fallbackSpecFile,
        lastSyncAt: syncResult.timestamp || new Date(),
        lastSyncStatus: syncResult.success ? 'success' : 'failed',
        lastSyncError: syncResult.error || null,
        specHash: syncResult.specHash
      }
    };

    return await this.upsertApiCatalog(metadata);
  }

  /**
   * Save Markdown-based API to catalog
   * @param {Object} config - Source configuration
   * @param {String} markdown - Raw Markdown content
   * @param {String} htmlDoc - Rendered HTML
   * @param {String} markdownHash - Content hash
   * @returns {Promise<Object>} Saved catalog entry
   */
  async saveMarkdownCatalog(config, markdown, htmlDoc, markdownHash) {
    const metadata = {
      name: config.name,
      slug: config.slug,
      description: config.description || 'API Documentation',
      category: config.category || 'General',
      baseUrl: config.gatewayUrl,
      documentation: config.fallbackMarkdownUrl,
      markdown,
      htmlDoc,
      mode: 'markdown',
      endpoints: [], // No endpoints for markdown-only
      featured: config.featured || false,
      pricing: config.pricing,
      rateLimit: config.rateLimit,
      icon: config.icon || '📄',
      color: config.color || '#6B7280',
      visibility: config.visibility || 'public',
      externalSource: {
        fallbackMarkdownUrl: config.fallbackMarkdownUrl,
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        specHash: markdownHash
      }
    };

    return await this.upsertApiCatalog(metadata);
  }

  /**
   * Get API catalog entry by slug
   * @param {String} slug - API slug
   * @returns {Promise<Object|null>} Catalog entry or null
   */
  async getApiCatalog(slug) {
    try {
      return await ApiCatalog.findOne({ slug });
    } catch (error) {
      logger.error(`Failed to get API catalog for ${slug}:`, error);
      return null;
    }
  }

  /**
   * Get all API catalogs
   * @param {Object} filter - Optional filter
   * @returns {Promise<Array>} Array of catalog entries
   */
  async getAllApiCatalogs(filter = {}) {
    try {
      return await ApiCatalog.find(filter).sort({ featured: -1, name: 1 });
    } catch (error) {
      logger.error('Failed to get API catalogs:', error);
      return [];
    }
  }

  /**
   * Get active (published) API catalogs
   * @returns {Promise<Array>} Array of active catalog entries
   */
  async getActiveApiCatalogs() {
    return await this.getAllApiCatalogs({ isActive: true });
  }

  /**
   * Get public API catalogs
   * @returns {Promise<Array>} Array of public catalog entries
   */
  async getPublicApiCatalogs() {
    return await this.getAllApiCatalogs({ 
      isActive: true, 
      visibility: 'public' 
    });
  }

  /**
   * Get featured API catalogs
   * @returns {Promise<Array>} Array of featured catalog entries
   */
  async getFeaturedApiCatalogs() {
    return await this.getAllApiCatalogs({ 
      isActive: true, 
      featured: true 
    });
  }

  /**
   * Delete API catalog entry
   * @param {String} slug - API slug
   * @returns {Promise<Boolean>} Success status
   */
  async deleteApiCatalog(slug) {
    try {
      logger.info(`Deleting API catalog entry for ${slug}`);
      const result = await ApiCatalog.deleteOne({ slug });
      logger.info(`✅ Deleted API catalog entry for ${slug}`);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Failed to delete API catalog for ${slug}:`, error);
      return false;
    }
  }

  /**
   * Update sync status for an API
   * @param {String} slug - API slug
   * @param {Object} status - Status update
   * @returns {Promise<void>}
   */
  async updateSyncStatus(slug, status) {
    try {
      await ApiCatalog.findOneAndUpdate(
        { slug },
        {
          $set: {
            'externalSource.lastSyncAt': status.timestamp || new Date(),
            'externalSource.lastSyncStatus': status.success ? 'success' : 'failed',
            'externalSource.lastSyncError': status.error || null,
            ...(status.specHash && { 'externalSource.specHash': status.specHash })
          }
        }
      );
    } catch (error) {
      logger.error(`Failed to update sync status for ${slug}:`, error);
    }
  }
}

module.exports = new ApiCatalogPersistenceService();
