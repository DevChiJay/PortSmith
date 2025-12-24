/**
 * OpenAPI Spec Transformation Service
 * 
 * Transforms raw OpenAPI specs to add PortSmith gateway routing,
 * security schemes, metadata, and code samples
 */

const logger = require('../utils/logger');

class SpecTransformService {
  /**
   * Transform a raw OpenAPI spec for PortSmith gateway
   * @param {Object} rawSpec - Original OpenAPI spec
   * @param {Object} config - Product configuration
   * @returns {Object} Transformed spec
   */
  transformSpec(rawSpec, config) {
    const {
      name,
      slug,
      description,
      gatewayUrl,
      pathPrefix,
      category,
      featured,
      pricing,
      rateLimit,
      icon,
      color
    } = config;

    logger.info(`Transforming spec for ${slug}`);

    // Deep clone to avoid mutating original
    const spec = JSON.parse(JSON.stringify(rawSpec));

    // 1. Transform info section
    spec.info.title = name || spec.info.title;
    if (description) {
      spec.info.description = description;
    }

    // Add PortSmith metadata
    spec.info['x-portsmith'] = {
      slug,
      category: category || 'General',
      featured: featured || false,
      icon: icon || '🔌',
      color: color || '#3B82F6',
      pricing: pricing || {},
      rateLimit: rateLimit || {}
    };

    // 2. Transform servers
    spec.servers = spec.servers || [];
    spec.servers.unshift({
      url: gatewayUrl,
      description: 'PortSmith Gateway'
    });

    // 3. Transform paths (add prefix and track original)
    const transformedPaths = {};
    for (const [originalPath, pathItem] of Object.entries(spec.paths || {})) {
      const newPath = pathPrefix + originalPath;
      
      // Clone path item and add original path tracking
      const transformedPathItem = { ...pathItem };
      transformedPathItem['x-portsmith-original-path'] = originalPath;
      
      transformedPaths[newPath] = transformedPathItem;
    }
    spec.paths = transformedPaths;

    // 4. Add security schemes
    spec.components = spec.components || {};
    spec.components.securitySchemes = spec.components.securitySchemes || {};
    
    // Add PortSmith API Key scheme
    spec.components.securitySchemes.portsmithApiKey = {
      type: 'apiKey',
      in: 'header',
      name: 'X-PortSmith-Key',
      description: 'API key for PortSmith Gateway authentication'
    };

    // 5. Add security to all operations
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          // Merge with existing security or add new
          operation.security = operation.security || [];
          operation.security.unshift({ portsmithApiKey: [] });
        }
      }
    }

    // 6. Add code samples to operations
    this._injectCodeSamples(spec, gatewayUrl);

    logger.info(`Transformation complete for ${slug}`);

    return spec;
  }

  /**
   * Inject code samples into operations
   * @private
   */
  _injectCodeSamples(spec, gatewayUrl) {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          operation['x-code-samples'] = this._generateCodeSamples(
            method.toUpperCase(),
            path,
            gatewayUrl,
            operation
          );
        }
      }
    }
  }

  /**
   * Generate code samples for an operation
   * @private
   */
  _generateCodeSamples(method, path, gatewayUrl, operation) {
    const url = `${gatewayUrl}${path}`;
    const samples = [];

    // cURL sample
    let curlCmd = `curl -X ${method} "${url}"`;
    curlCmd += ` \\\n  -H "X-PortSmith-Key: YOUR_API_KEY"`;
    curlCmd += ` \\\n  -H "Content-Type: application/json"`;
    
    if (method !== 'GET' && operation.requestBody) {
      curlCmd += ` \\\n  -d '{"key": "value"}'`;
    }

    samples.push({
      lang: 'Shell',
      label: 'cURL',
      source: curlCmd
    });

    // JavaScript sample
    const jsCode = `fetch('${url}', {
  method: '${method}',
  headers: {
    'X-PortSmith-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${method !== 'GET' && operation.requestBody ? `,
  body: JSON.stringify({key: 'value'})` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

    samples.push({
      lang: 'JavaScript',
      label: 'Fetch',
      source: jsCode
    });

    // Python sample
    const pythonCode = `import requests

url = '${url}'
headers = {
    'X-PortSmith-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
}${method !== 'GET' && operation.requestBody ? `
data = {'key': 'value'}

response = requests.${method.toLowerCase()}(url, headers=headers, json=data)` : `

response = requests.${method.toLowerCase()}(url, headers=headers)`}
print(response.json())`;

    samples.push({
      lang: 'Python',
      label: 'Requests',
      source: pythonCode
    });

    return samples;
  }

  /**
   * Derive endpoints from OpenAPI spec
   * @param {Object} spec - Transformed OpenAPI spec
   * @returns {Array} Array of endpoint objects
   */
  deriveEndpoints(spec) {
    const endpoints = [];

    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          const endpoint = {
            path,
            method: method.toUpperCase(),
            summary: operation.summary || '',
            description: operation.description || '',
            tags: operation.tags || [],
            requiresAuth: this._requiresAuth(operation)
          };

          endpoints.push(endpoint);
        }
      }
    }

    return endpoints;
  }

  /**
   * Check if operation requires authentication
   * @private
   */
  _requiresAuth(operation) {
    if (!operation.security || operation.security.length === 0) {
      return false;
    }

    // Check if any security scheme is defined
    return operation.security.some(sec => Object.keys(sec).length > 0);
  }

  /**
   * Extract metadata from transformed spec
   * @param {Object} spec - Transformed spec
   * @returns {Object} Metadata object
   */
  extractMetadata(spec) {
    const portsmithMeta = spec.info?.['x-portsmith'] || {};
    
    return {
      title: spec.info?.title || 'Unknown API',
      version: spec.info?.version || '1.0.0',
      description: spec.info?.description || '',
      category: portsmithMeta.category || 'General',
      featured: portsmithMeta.featured || false,
      icon: portsmithMeta.icon || '🔌',
      color: portsmithMeta.color || '#3B82F6',
      pricing: portsmithMeta.pricing || {},
      rateLimit: portsmithMeta.rateLimit || {}
    };
  }
}

module.exports = new SpecTransformService();
