/**
 * External API Source Helper Service
 * 
 * Provides utilities for working with external API sources configuration
 */

const { 
  externalApiSources, 
  getEnabledSources, 
  getSourceBySlug, 
  getAllProducts,
  validateSource 
} = require('../config/externalApiSources');
const logger = require('../utils/logger');

class ExternalApiSourceService {
  /**
   * Get all configured API sources (enabled and disabled)
   * @returns {Array} All API sources
   */
  getAllSources() {
    return externalApiSources;
  }

  /**
   * Get only enabled API sources
   * @returns {Array} Enabled API sources
   */
  getActiveSources() {
    return getEnabledSources();
  }

  /**
   * Get a specific source by slug
   * @param {String} slug - API slug
   * @returns {Object|null} API source or null
   */
  getSource(slug) {
    return getSourceBySlug(slug);
  }

  /**
   * Get all products (including slices from monorepo sources)
   * @returns {Array} All product configurations
   */
  getProducts() {
    return getAllProducts();
  }

  /**
   * Get products for a specific category
   * @param {String} category - Category name
   * @returns {Array} Products in the category
   */
  getProductsByCategory(category) {
    return getAllProducts().filter(p => p.category === category);
  }

  /**
   * Get featured products
   * @returns {Array} Featured products
   */
  getFeaturedProducts() {
    return getAllProducts().filter(p => p.featured === true);
  }

  /**
   * Get products by visibility
   * @param {String} visibility - 'public' or 'private'
   * @returns {Array} Products with matching visibility
   */
  getProductsByVisibility(visibility) {
    return getAllProducts().filter(p => p.visibility === visibility);
  }

  /**
   * Validate all configured sources
   * @returns {Object} Validation summary { valid: number, invalid: number, errors: Array }
   */
  validateAllSources() {
    const results = {
      valid: 0,
      invalid: 0,
      errors: []
    };

    externalApiSources.forEach(source => {
      const validation = validateSource(source);
      
      if (validation.valid) {
        results.valid++;
      } else {
        results.invalid++;
        results.errors.push({
          slug: source.slug,
          name: source.name,
          errors: validation.errors
        });
      }

      // Validate products if any
      if (source.products && Array.isArray(source.products)) {
        source.products.forEach(product => {
          const productValidation = validateSource({
            ...product,
            liveUrl: source.liveUrl,
            gatewayUrl: product.gatewayUrl || source.gatewayUrl,
            fallbackSpecFile: source.fallbackSpecFile
          });

          if (productValidation.valid) {
            results.valid++;
          } else {
            results.invalid++;
            results.errors.push({
              slug: product.slug,
              name: product.name,
              parentSlug: source.slug,
              errors: productValidation.errors
            });
          }
        });
      }
    });

    return results;
  }

  /**
   * Get configuration summary
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const sources = externalApiSources;
    const products = getAllProducts();
    
    return {
      totalSources: sources.length,
      enabledSources: getEnabledSources().length,
      totalProducts: products.length,
      publicProducts: products.filter(p => p.visibility === 'public').length,
      privateProducts: products.filter(p => p.visibility === 'private').length,
      featuredProducts: products.filter(p => p.featured === true).length,
      categories: [...new Set(products.map(p => p.category))],
      modes: {
        openapi: products.filter(p => p.mode !== 'markdown').length,
        markdown: products.filter(p => p.mode === 'markdown').length
      }
    };
  }

  /**
   * Log configuration summary
   */
  logSummary() {
    const summary = this.getSummary();
    logger.info('External API Sources Configuration Summary:', summary);
    
    const validation = this.validateAllSources();
    if (validation.invalid > 0) {
      logger.warn(`Found ${validation.invalid} invalid source configuration(s):`);
      validation.errors.forEach(err => {
        logger.warn(`  - ${err.name} (${err.slug}): ${err.errors.join(', ')}`);
      });
    } else {
      logger.info(`All ${validation.valid} source configurations are valid`);
    }
  }
}

module.exports = new ExternalApiSourceService();
