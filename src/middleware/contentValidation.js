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
  /soo-foo\.com/i,
  /legends\s*bet|epic\s*winnings/i,
  /crypto\s*loko|mgm\s*online|sky\s*sweeps\s*casino/i,
  /no\s*deposit\s*coupon|live\s*casino\s*slot\s*games/i,
  /sports\s*betting|bovada|gacor/i,
];

/**
 * Validate content for malicious patterns
 * @param {string} content - Content to validate
 * @param {string} fieldName - Name of the field being validated (for error messages)
 * @throws {Error} If malicious content is detected
 */

export function validateContent(content, fieldName = "content") {
  // NOTE: Validation disabled per project requirement.
  // Keep function for backward compatibility with existing API routes.
  // Always return true and never throw (so product/blog create won't get blocked).
  void content;
  void fieldName;
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
 * Check if content is safe for meta tags (no malicious patterns)
 * Use this when displaying meta from DB - returns empty string if malicious
 * @param {string} content - Content to check
 * @returns {string} Original content if safe, empty string if malicious
 */

export function getSafeMetaContent(content) {
  if (!content || typeof content !== 'string') return '';
  // Validation disabled: return content as-is
  return content;
}

/**
 * Sanitize content by removing malicious patterns
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content) {
  // Sanitization disabled: return content as-is
  return content;
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