const ApiCatalog = require('../models/ApiCatalog');
const logger = require('../utils/logger');
const apiConfigService = require('../config/apis');
const apiCatalogPersistenceService = require('../services/apiCatalogPersistenceService');
const { sendContactEmail } = require('../utils/emailService');

// Get all available APIs
exports.getAllApis = async (req, res) => {
  try {
    const apis = await ApiCatalog.find({ isActive: true });
    
    // Return only public information
    const apiList = apis.map(api => ({
      id: api._id,
      name: api.name,
      slug: api.slug,
      description: api.description,
      documentation: api.documentation,
      featured: api.featured || false
    }));
    
    res.json({ apis: apiList });
  } catch (error) {
    logger.error('Error fetching API catalog:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API catalog'
    });
  }
};

// Get featured APIs (limited to first 6)
exports.getFeaturedApis = async (req, res) => {
  try {
    // Get active APIs and limit to the first 6 to showcase as featured
    const featuredApis = await ApiCatalog.find({ isActive: true })
      .sort({ updatedAt: 1 }) // Get the most recently updated APIs
      .limit(6);
    
    // Return only public information for the featured APIs
    const apiList = featuredApis.map(api => ({
      id: api._id,
      name: api.name,
      slug: api.slug,
      description: api.description,
      documentation: api.documentation
    }));
    
    res.json({ 
      featured: apiList,
      count: apiList.length
    });
  } catch (error) {
    logger.error('Error fetching featured APIs:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve featured APIs'
    });
  }
};

// Get a specific API by ID or slug
exports.getApiByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    // Check if the idOrSlug can be a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    
    let query;
    if (isValidObjectId) {
      // If it looks like an ObjectId, search by both id and slug
      query = {
        $or: [
          { _id: idOrSlug },
          { slug: idOrSlug.toLowerCase() }
        ],
        isActive: true
      };
    } else {
      // If it's definitely not an ObjectId, just search by slug
      query = {
        slug: idOrSlug.toLowerCase(),
        isActive: true
      };
    }
    
    let api = await ApiCatalog.findOne(query);
    
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API not found'
      });
    }
    
    res.json({
      id: api._id,
      name: api.name,
      slug: api.slug,
      description: api.description,
      baseUrl: api.baseUrl,
      endpoints: api.endpoints,
      documentation: api.documentation,
      authType: api.authType,
      defaultRateLimit: api.defaultRateLimit
    });
  } catch (error) {
    logger.error(`Error fetching API ${req.params.idOrSlug}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API details'
    });
  }
};

// Add a new API to the catalog
exports.addApi = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    
    // In a real application, check if user is an admin
    // For now, assuming any authenticated user can add APIs
    
    const {
      name,
      slug,
      description,
      baseUrl,
      endpoints,
      documentation,
      authType,
      defaultRateLimit,
      visibility
    } = req.body;
    
    // Validation
    if (!name || !slug || !description || !baseUrl) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: name, slug, description, baseUrl'
      });
    }
    
    // Check if API with this slug already exists
    const existingApi = await ApiCatalog.findOne({ slug: slug.toLowerCase() });
    
    if (existingApi) {
      return res.status(409).json({
        error: 'Conflict',
        message: `API with slug '${slug}' already exists`
      });
    }
    
    // Create the new API
    const newApi = new ApiCatalog({
      name,
      slug: slug.toLowerCase(),
      description,
      baseUrl,
      endpoints: endpoints || [],
      documentation,
      authType: authType || 'apiKey',
      defaultRateLimit,
      visibility: visibility || 'public'
    });
    
    await newApi.save();
    
    // Invalidate cache so gateways pick up the new API
    apiConfigService.clearCache();
    
    logger.info(`User ${userId} created new API: ${name}`);
    
    res.status(201).json({
      id: newApi._id,
      name: newApi.name,
      slug: newApi.slug,
      message: 'API added to catalog successfully'
    });
  } catch (error) {
    logger.error('Error creating API:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add API to catalog'
    });
  }
};

// Update an API
exports.updateApi = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    
    // In a real application, check if user is an admin
    
    const apiId = req.params.id;
    const {
      name,
      description,
      baseUrl,
      endpoints,
      documentation,
      authType,
      defaultRateLimit,
      isActive,
      visibility
    } = req.body;
    
    const api = await ApiCatalog.findById(apiId);
    
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API not found'
      });
    }
    
    // Update fields
    if (name) api.name = name;
    if (description) api.description = description;
    if (baseUrl) api.baseUrl = baseUrl;
    if (endpoints) api.endpoints = endpoints;
    if (documentation) api.documentation = documentation;
    if (authType) api.authType = authType;
    if (defaultRateLimit) api.defaultRateLimit = defaultRateLimit;
    if (isActive !== undefined) api.isActive = isActive;
    if (visibility) api.visibility = visibility;
    
    api.updatedAt = Date.now();
    
    await api.save();
    
    // Invalidate cache so gateways pick up changes
    apiConfigService.clearCache();
    
    logger.info(`User ${userId} updated API ${apiId}`);
    
    res.json({
      id: api._id,
      name: api.name,
      message: 'API updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating API ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update API'
    });
  }
};

// Delete (deactivate) an API
exports.deleteApi = async (req, res) => {
  try {
    const userId = req.user.id; // MongoDB ObjectId from JWT
    
    // In a real application, check if user is an admin
    
    const apiId = req.params.id;
    
    const api = await ApiCatalog.findById(apiId);
    
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API not found'
      });
    }
    
    // Instead of hard deleting, set isActive to false
    api.isActive = false;
    await api.save();
    
    // Invalidate cache so gateways stop serving this API
    apiConfigService.clearCache();
    
    logger.info(`User ${userId} deactivated API ${apiId}`);
    
    res.json({
      message: 'API deactivated successfully'
    });
  } catch (error) {
    logger.error(`Error deactivating API ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to deactivate API'
    });
  }
};

// Get API documentation (OpenAPI spec or Markdown HTML)
exports.getApiDocs = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const api = await apiCatalogPersistenceService.getApiCatalog(slug);
    
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: `API documentation not found for: ${slug}`
      });
    }

    // Return appropriate documentation based on mode
    if (api.mode === 'openapi' && api.specData) {
      return res.json({
        mode: 'openapi',
        name: api.name,
        description: api.description,
        version: api.specData.info?.version || '1.0.0',
        spec: api.specData,
        endpoints: api.endpoints || [],
        lastUpdated: api.externalSource?.lastSyncAt || api.updatedAt
      });
    } else if (api.mode === 'markdown' && api.htmlDoc) {
      return res.json({
        mode: 'markdown',
        name: api.name,
        description: api.description,
        html: api.htmlDoc,
        markdown: api.markdown,
        lastUpdated: api.externalSource?.lastSyncAt || api.updatedAt
      });
    } else {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API documentation not available'
      });
    }
  } catch (error) {
    logger.error(`Error fetching API docs for ${req.params.slug}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API documentation'
    });
  }
};

// Get raw OpenAPI spec (download)
exports.getRawSpec = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const api = await apiCatalogPersistenceService.getApiCatalog(slug);
    
    if (!api || api.mode !== 'openapi' || !api.specData) {
      return res.status(404).json({
        error: 'Not Found',
        message: `OpenAPI spec not found for: ${slug}`
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-openapi.json"`);
    res.json(api.specData);
  } catch (error) {
    logger.error(`Error fetching raw spec for ${req.params.slug}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve OpenAPI spec'
    });
  }
};

// Get API by slug (detailed info)
exports.getApiBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const api = await apiCatalogPersistenceService.getApiCatalog(slug);
    
    if (!api) {
      return res.status(404).json({
        error: 'Not Found',
        message: `API not found: ${slug}`
      });
    }

    // Return public API information with documentation
    res.json({
      id: api._id,
      name: api.name,
      slug: api.slug,
      description: api.description,
      category: api.category,
      icon: api.icon,
      color: api.color,
      visibility: api.visibility,
      featured: api.featured,
      mode: api.mode,
      documentation: api.documentation,
      baseUrl: api.baseUrl,
      endpoints: api.endpoints || [],
      pricing: api.pricing,
      rateLimit: api.defaultRateLimit,
      version: api.version,
      // Include documentation content based on mode
      specData: api.mode === 'openapi' ? api.specData : undefined,
      htmlDoc: api.mode === 'markdown' ? api.htmlDoc : undefined,
      lastUpdated: api.externalSource?.lastSyncAt || api.updatedAt
    });
  } catch (error) {
    logger.error(`Error fetching API ${req.params.slug}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API'
    });
  }
};

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message, sendTo, subject } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email, and message are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email address'
      });
    }

    // Validate name length
    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name must be at least 2 characters long'
      });
    }

    // Validate message length
    if (message.trim().length < 10) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message must be at least 10 characters long'
      });
    }

    // Send email
    const defaultRecipient = process.env.CONTACT_EMAIL;
    const emailResult = await sendContactEmail(
      name.trim(),
      email.trim(),
      message.trim(),
      sendTo?.trim() || defaultRecipient,
      subject?.trim() || null
    );

    logger.info(`Contact form submission from ${email} processed successfully`);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      simulated: emailResult.simulated || false
    });
  } catch (error) {
    logger.error('Error processing contact form:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send your message. Please try again later.'
    });
  }
};

