/**
 * OpenAPI Spec Fetcher Service
 * 
 * Handles fetching OpenAPI specs from external FastAPI services
 * with authentication, timeouts, and fallback support
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

class SpecFetcherService {
  constructor() {
    this.FETCH_TIMEOUT = 30000; // 30 seconds
    this.SPECS_CACHE_DIR = path.join(__dirname, '../../specs-cache');
  }

  /**
   * Fetch OpenAPI spec from a live URL
   * @param {Object} source - API source configuration
   * @returns {Promise<Object>} { success: boolean, spec: Object|null, error: string|null, source: string }
   */
  async fetchLiveSpec(source) {
    const { liveUrl, slug, auth } = source;
    
    if (!liveUrl) {
      return { success: false, spec: null, error: 'No live URL configured', source: 'none' };
    }

    const specUrl = `${liveUrl}/openapi.json`;
    
    try {
      logger.info(`Fetching OpenAPI spec from ${specUrl} for ${slug}`);
      
      // Build request config
      const config = {
        timeout: this.FETCH_TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PortSmith-SpecFetcher/1.0'
        }
      };

      // Add authentication if configured
      if (auth) {
        this._addAuthToConfig(config, auth);
      }

      // Fetch the spec
      const response = await axios.get(specUrl, config);

      // Validate response
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid JSON response');
      }

      // Basic OpenAPI validation
      if (!this._isValidOpenApiSpec(response.data)) {
        throw new Error('Response is not a valid OpenAPI spec');
      }

      logger.info(`✅ Successfully fetched spec for ${slug} from live URL`);
      
      return {
        success: true,
        spec: response.data,
        error: null,
        source: 'live'
      };

    } catch (error) {
      const errorMessage = error.response 
        ? `HTTP ${error.response.status}: ${error.response.statusText}`
        : error.code === 'ECONNABORTED'
          ? 'Request timeout'
          : error.message;

      logger.warn(`Failed to fetch live spec for ${slug}: ${errorMessage}`);
      
      return {
        success: false,
        spec: null,
        error: errorMessage,
        source: 'live-failed'
      };
    }
  }

  /**
   * Load spec from fallback file
   * @param {Object} source - API source configuration
   * @returns {Promise<Object>} { success: boolean, spec: Object|null, error: string|null, source: string }
   */
  async loadFallbackSpec(source) {
    const { fallbackSpecFile, slug } = source;
    
    if (!fallbackSpecFile) {
      return { success: false, spec: null, error: 'No fallback file configured', source: 'none' };
    }

    try {
      const filePath = path.resolve(fallbackSpecFile);
      logger.info(`Loading fallback spec from ${filePath} for ${slug}`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const spec = JSON.parse(fileContent);

      if (!this._isValidOpenApiSpec(spec)) {
        throw new Error('Fallback file is not a valid OpenAPI spec');
      }

      logger.info(`✅ Successfully loaded fallback spec for ${slug}`);
      
      return {
        success: true,
        spec,
        error: null,
        source: 'fallback'
      };

    } catch (error) {
      logger.warn(`Failed to load fallback spec for ${slug}: ${error.message}`);
      
      return {
        success: false,
        spec: null,
        error: error.message,
        source: 'fallback-failed'
      };
    }
  }

  /**
   * Fetch spec with fallback strategy (hybrid mode)
   * @param {Object} source - API source configuration
   * @param {String} mode - 'live', 'fallback', or 'hybrid' (default)
   * @returns {Promise<Object>} { success: boolean, spec: Object|null, error: string|null, source: string }
   */
  async fetchSpec(source, mode = 'hybrid') {
    const { slug } = source;
    
    logger.info(`Fetching spec for ${slug} in ${mode} mode`);

    // Force markdown mode - no spec fetch needed
    if (source.mode === 'markdown') {
      return {
        success: false,
        spec: null,
        error: 'Source is configured for markdown mode only',
        source: 'markdown'
      };
    }

    // Live-only mode
    if (mode === 'live') {
      return await this.fetchLiveSpec(source);
    }

    // Fallback-only mode
    if (mode === 'fallback') {
      return await this.loadFallbackSpec(source);
    }

    // Hybrid mode: try live first, fall back to file
    const liveResult = await this.fetchLiveSpec(source);
    
    if (liveResult.success) {
      return liveResult;
    }

    logger.info(`Live fetch failed for ${slug}, trying fallback`);
    const fallbackResult = await this.loadFallbackSpec(source);
    
    if (fallbackResult.success) {
      return fallbackResult;
    }

    // Both failed
    return {
      success: false,
      spec: null,
      error: `Live fetch failed: ${liveResult.error}. Fallback failed: ${fallbackResult.error}`,
      source: 'all-failed'
    };
  }

  /**
   * Cache a spec to disk
   * @param {String} slug - API slug
   * @param {Object} spec - OpenAPI spec
   * @returns {Promise<void>}
   */
  async cacheSpec(slug, spec) {
    try {
      // Ensure cache directory exists
      await fs.mkdir(this.SPECS_CACHE_DIR, { recursive: true });
      
      const filePath = path.join(this.SPECS_CACHE_DIR, `${slug}.json`);
      await fs.writeFile(filePath, JSON.stringify(spec, null, 2), 'utf-8');
      
      logger.info(`Cached spec for ${slug} to ${filePath}`);
    } catch (error) {
      logger.error(`Failed to cache spec for ${slug}: ${error.message}`);
    }
  }

  /**
   * Load spec from cache
   * @param {String} slug - API slug
   * @returns {Promise<Object|null>} Spec or null if not found
   */
  async loadCachedSpec(slug) {
    try {
      const filePath = path.join(this.SPECS_CACHE_DIR, `${slug}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      logger.debug(`No cached spec found for ${slug}`);
      return null;
    }
  }

  /**
   * Calculate hash of spec for change detection
   * @param {Object} spec - OpenAPI spec
   * @returns {String} SHA256 hash
   */
  calculateSpecHash(spec) {
    const content = JSON.stringify(spec);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if spec has changed since last sync
   * @param {String} slug - API slug
   * @param {Object} newSpec - New spec to compare
   * @returns {Promise<Boolean>} True if changed
   */
  async hasSpecChanged(slug, newSpec) {
    const cachedSpec = await this.loadCachedSpec(slug);
    
    if (!cachedSpec) {
      return true; // No cache = consider it changed
    }

    const cachedHash = this.calculateSpecHash(cachedSpec);
    const newHash = this.calculateSpecHash(newSpec);
    
    return cachedHash !== newHash;
  }

  /**
   * Add authentication to axios config
   * @private
   */
  _addAuthToConfig(config, auth) {
    if (!auth || !auth.type) return;

    switch (auth.type) {
      case 'header':
        if (auth.header && auth.value) {
          config.headers[auth.header] = auth.value;
        }
        break;
      
      case 'query':
        if (auth.param && auth.value) {
          config.params = config.params || {};
          config.params[auth.param] = auth.value;
        }
        break;
      
      case 'basic':
        if (auth.username && auth.password) {
          config.auth = {
            username: auth.username,
            password: auth.password
          };
        }
        break;
    }
  }

  /**
   * Validate if object is a valid OpenAPI spec
   * @private
   */
  _isValidOpenApiSpec(spec) {
    if (!spec || typeof spec !== 'object') {
      return false;
    }

    // Check for OpenAPI version
    const hasOpenApiVersion = spec.openapi && spec.openapi.startsWith('3.');
    const hasSwaggerVersion = spec.swagger && spec.swagger.startsWith('2.');
    
    if (!hasOpenApiVersion && !hasSwaggerVersion) {
      return false;
    }

    // Check for required fields
    if (!spec.info || !spec.paths) {
      return false;
    }

    return true;
  }

  /**
   * Ensure specs cache directory exists
   * @returns {Promise<void>}
   */
  async ensureCacheDirectory() {
    try {
      await fs.mkdir(this.SPECS_CACHE_DIR, { recursive: true });
      logger.info(`Specs cache directory ready: ${this.SPECS_CACHE_DIR}`);
    } catch (error) {
      logger.error(`Failed to create specs cache directory: ${error.message}`);
    }
  }
}

module.exports = new SpecFetcherService();
