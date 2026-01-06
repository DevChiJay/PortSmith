const logger = require('../utils/logger');

/**
 * Middleware to sanitize request body before JSON parsing
 * Escapes control characters that would cause JSON.parse to fail
 */
const sanitizeBody = (req, res, next) => {
  // Only process if content-type is JSON
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return next();
  }

  let rawBody = '';

  // Collect raw body data
  req.on('data', (chunk) => {
    rawBody += chunk.toString('utf8');
  });

  req.on('end', () => {
    try {
      if (!rawBody) {
        return next();
      }

      // Sanitize the raw JSON string by escaping control characters
      const sanitized = sanitizeJsonString(rawBody);

      // Parse the sanitized JSON
      req.body = JSON.parse(sanitized);
      next();
    } catch (error) {
      logger.error('Error parsing sanitized JSON:', error.message);
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body contains invalid JSON format',
        details: error.message
      });
    }
  });

  req.on('error', (error) => {
    logger.error('Error reading request body:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Error reading request body'
    });
  });
};

/**
 * Sanitizes a JSON string by escaping control characters within string values
 * @param {string} jsonString - The raw JSON string
 * @returns {string} Sanitized JSON string
 */
function sanitizeJsonString(jsonString) {
  let result = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    const charCode = char.charCodeAt(0);

    // Handle escape sequences
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }

    // Toggle string state when we encounter unescaped quotes
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    // If we're inside a string, escape control characters
    if (inString) {
      // Control characters are characters with charCode < 32 (except space which is 32)
      if (charCode < 32) {
        switch (char) {
          case '\n':
            result += '\\n';
            break;
          case '\r':
            result += '\\r';
            break;
          case '\t':
            result += '\\t';
            break;
          case '\b':
            result += '\\b';
            break;
          case '\f':
            result += '\\f';
            break;
          default:
            // For other control characters, use unicode escape
            result += '\\u' + ('0000' + charCode.toString(16)).slice(-4);
            break;
        }
      } else {
        result += char;
      }
    } else {
      // Outside strings, keep everything as-is
      result += char;
    }
  }

  return result;
}

module.exports = sanitizeBody;
