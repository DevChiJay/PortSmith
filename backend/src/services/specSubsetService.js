/**
 * OpenAPI Spec Subsetting Utility
 * 
 * Creates subset OpenAPI specs from a larger monorepo spec
 * by filtering paths based on tags or path prefixes
 */

const logger = require('../utils/logger');

class SpecSubsetService {
  /**
   * Create a subset spec from a raw spec based on slice configuration
   * @param {Object} rawSpec - Full OpenAPI spec
   * @param {Object} sliceConfig - { tags?: string[], pathPrefixes?: string[], name?: string, slug?: string }
   * @returns {Object} Subset OpenAPI spec
   */
  subsetSpec(rawSpec, sliceConfig) {
    const { tags, pathPrefixes, name, slug } = sliceConfig;

    logger.info(`Creating subset spec for ${slug || 'unknown'}`);

    if (!tags && !pathPrefixes) {
      logger.warn('No tags or pathPrefixes provided, returning full spec');
      return this._cloneSpec(rawSpec);
    }

    // Clone the base spec structure
    const subsetSpec = this._cloneSpec(rawSpec);

    // Filter paths
    subsetSpec.paths = this._filterPaths(rawSpec.paths, { tags, pathPrefixes });

    // Update info if name is provided
    if (name) {
      subsetSpec.info.title = name;
    }

    // Track filtering metadata
    const originalPathCount = Object.keys(rawSpec.paths || {}).length;
    const filteredPathCount = Object.keys(subsetSpec.paths || {}).length;
    
    logger.info(`Filtered spec for ${slug}: ${filteredPathCount}/${originalPathCount} paths included`);

    return subsetSpec;
  }

  /**
   * Clone spec structure (shallow clone with deep clone of info and components)
   * @private
   */
  _cloneSpec(spec) {
    return {
      openapi: spec.openapi,
      info: { ...spec.info },
      servers: spec.servers ? [...spec.servers] : [],
      paths: {},
      components: spec.components ? this._cloneComponents(spec.components) : {},
      security: spec.security ? [...spec.security] : [],
      tags: spec.tags ? [...spec.tags] : [],
      externalDocs: spec.externalDocs ? { ...spec.externalDocs } : undefined
    };
  }

  /**
   * Clone components (schemas, parameters, etc.)
   * @private
   */
  _cloneComponents(components) {
    const cloned = {};
    
    for (const [key, value] of Object.entries(components)) {
      if (typeof value === 'object' && value !== null) {
        cloned[key] = JSON.parse(JSON.stringify(value));
      } else {
        cloned[key] = value;
      }
    }
    
    return cloned;
  }

  /**
   * Filter paths based on tags or path prefixes
   * @private
   */
  _filterPaths(paths, { tags, pathPrefixes }) {
    if (!paths || typeof paths !== 'object') {
      return {};
    }

    const filtered = {};

    for (const [pathKey, pathItem] of Object.entries(paths)) {
      // Check if path matches prefix filter
      if (pathPrefixes && pathPrefixes.length > 0) {
        const matchesPrefix = pathPrefixes.some(prefix => 
          pathKey.startsWith(prefix)
        );
        
        if (matchesPrefix) {
          filtered[pathKey] = this._filterPathItemByTags(pathItem, tags);
          continue;
        }
      }

      // Check if any operation in this path has matching tags
      if (tags && tags.length > 0) {
        const filteredPathItem = this._filterPathItemByTags(pathItem, tags);
        
        // Only include if at least one operation matches
        if (this._hasOperations(filteredPathItem)) {
          filtered[pathKey] = filteredPathItem;
        }
      }

      // If no filters specified, include all
      if ((!tags || tags.length === 0) && (!pathPrefixes || pathPrefixes.length === 0)) {
        filtered[pathKey] = { ...pathItem };
      }
    }

    return filtered;
  }

  /**
   * Filter operations in a path item by tags
   * @private
   */
  _filterPathItemByTags(pathItem, tags) {
    if (!tags || tags.length === 0) {
      return { ...pathItem };
    }

    const filtered = {};
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

    for (const [key, value] of Object.entries(pathItem)) {
      // Copy non-operation fields as-is
      if (!httpMethods.includes(key.toLowerCase())) {
        filtered[key] = value;
        continue;
      }

      // Check if operation has matching tags
      const operation = value;
      if (operation.tags && Array.isArray(operation.tags)) {
        const hasMatchingTag = operation.tags.some(tag => 
          tags.includes(tag)
        );
        
        if (hasMatchingTag) {
          filtered[key] = { ...operation };
        }
      }
    }

    return filtered;
  }

  /**
   * Check if a path item has any operations
   * @private
   */
  _hasOperations(pathItem) {
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];
    
    for (const method of httpMethods) {
      if (pathItem[method]) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all unique tags from a spec
   * @param {Object} spec - OpenAPI spec
   * @returns {Array<string>} Array of unique tags
   */
  getAllTags(spec) {
    const tags = new Set();

    if (spec.tags && Array.isArray(spec.tags)) {
      spec.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tags.add(tag);
        } else if (tag.name) {
          tags.add(tag.name);
        }
      });
    }

    if (spec.paths) {
      for (const pathItem of Object.values(spec.paths)) {
        for (const [key, operation] of Object.entries(pathItem)) {
          if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(key)) {
            if (operation.tags && Array.isArray(operation.tags)) {
              operation.tags.forEach(tag => tags.add(tag));
            }
          }
        }
      }
    }

    return Array.from(tags).sort();
  }

  /**
   * Get all path prefixes (first segment of each path)
   * @param {Object} spec - OpenAPI spec
   * @returns {Array<string>} Array of unique path prefixes
   */
  getAllPathPrefixes(spec) {
    const prefixes = new Set();

    if (spec.paths) {
      for (const pathKey of Object.keys(spec.paths)) {
        const segments = pathKey.split('/').filter(s => s.length > 0);
        if (segments.length > 0) {
          prefixes.add(`/${segments[0]}`);
        }
      }
    }

    return Array.from(prefixes).sort();
  }

  /**
   * Get statistics about a spec
   * @param {Object} spec - OpenAPI spec
   * @returns {Object} Stats about the spec
   */
  getSpecStats(spec) {
    const paths = spec.paths || {};
    let operationCount = 0;
    const methods = {};
    const tags = new Set();

    for (const pathItem of Object.values(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          operationCount++;
          methods[method] = (methods[method] || 0) + 1;
          
          if (operation.tags) {
            operation.tags.forEach(tag => tags.add(tag));
          }
        }
      }
    }

    return {
      title: spec.info?.title || 'Unknown',
      version: spec.info?.version || 'Unknown',
      pathCount: Object.keys(paths).length,
      operationCount,
      methodCounts: methods,
      tagCount: tags.size,
      tags: Array.from(tags).sort()
    };
  }
}

module.exports = new SpecSubsetService();
