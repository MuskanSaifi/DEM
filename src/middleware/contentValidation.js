// Content Validation Middleware - Prevent Malicious Content Injection

// Malicious patterns to detect and block
const maliciousPatterns = [
  /casino/i,
  /gambling/i,
  /bet/i,
  /poker/i,
  /slot/i,
  /free.*spin/i,
  /withdrawal.*crypto/i,
  /instant.*withdrawal/i,
  /fast.*payout/i,
  /no.*deposit.*crypto/i,
  /cash.*out.*money/i,
  /unleash.*fortune/i,
  /crypto.*casino/i,
  /online.*casino/i,
  /casino.*bonus/i,
  /gambling.*site/i,
  /soccer.*betting/i,
  /betting.*sites/i,
  /top.*betting/i,
  /vip.*levels/i,
  /exciting.*bonuses/i,
  /soo-foo\.com/i
];

/**
 * Validate content for malicious patterns
 * @param {string} content - Content to validate
 * @param {string} fieldName - Name of the field being validated (for error messages)
 * @throws {Error} If malicious content is detected
 */
export function validateContent(content, fieldName = 'content') {
  if (!content || typeof content !== 'string') {
    return true; // Empty or non-string content is valid
  }

  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      console.error(`❌ Malicious content detected in ${fieldName}:`, content.substring(0, 100));
      throw new Error(`Malicious content detected in ${fieldName}. Please remove inappropriate content.`);
    }
  }

  return true;
}

/**
 * Validate multiple fields at once
 * @param {Object} fields - Object with field names as keys and content as values
 * @throws {Error} If any field contains malicious content
 */
export function validateFields(fields) {
  for (const [fieldName, content] of Object.entries(fields)) {
    if (content) {
      validateContent(content, fieldName);
    }
  }
  return true;
}

/**
 * Sanitize content by removing malicious patterns
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let sanitized = content;
  for (const pattern of maliciousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized.trim();
}

/**
 * Middleware function for API routes
 * Validates request body for malicious content
 */
export function contentValidationMiddleware(req, res, next) {
  try {
    const body = req.body || {};
    
    // Fields to validate
    const fieldsToValidate = [
      'name',
      'description',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
      'title',
      'content',
      'productslug'
    ];

    const fields = {};
    for (const field of fieldsToValidate) {
      if (body[field]) {
        fields[field] = body[field];
      }
    }

    // Validate all fields
    validateFields(fields);
    
    next();
  } catch (error) {
    console.error('❌ Content validation failed:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Malicious content detected. Please remove inappropriate content.'
    });
  }
}

export default {
  validateContent,
  validateFields,
  sanitizeContent,
  contentValidationMiddleware
};
