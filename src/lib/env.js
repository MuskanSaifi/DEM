/**
 * Central env access — no hardcoded secrets in app code.
 */

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${name} is not set in environment (.env)`);
  }
  return String(value).trim();
}

function optionalEnv(name, defaultValue = "") {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === "") {
    return defaultValue;
  }
  return String(value).trim();
}

export function getJwtSecret() {
  return requireEnv("JWT_SECRET");
}

export function getTwoFactorApiKey() {
  return requireEnv("TWO_FACTOR_API_KEY");
}

/** DLT sender id (6 chars), e.g. INODEM */
export function getTwoFactorSenderId() {
  return requireEnv("TWO_FACTOR_SENDER_ID");
}

/** Login / register / buyer OTP SMS template name (2Factor dashboard). */
export function getTwoFactorOtpTemplate() {
  return requireEnv("TWO_FACTOR_OTP_TEMPLATE");
}

/** GRC certificate verification — 2Factor DLT template name (e.g. GRCVerifyOTP). */
export function getTwoFactorGrcTemplate() {
  return requireEnv("TWO_FACTOR_GRC_TEMPLATE");
}

/** If GRC template is not on SMS route yet, send via this SMS template (optional). */
export function getTwoFactorGrcSmsFallbackTemplate() {
  return optionalEnv("TWO_FACTOR_GRC_SMS_FALLBACK", "");
}

export function getOtpExpireMinutes() {
  const n = parseInt(optionalEnv("OTP_EXPIRE_MINUTES", "5"), 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export function getTestOtpPhone() {
  return optionalEnv("TEST_OTP_PHONE", "");
}

export function getTestOtpCode() {
  return optionalEnv("TEST_OTP_CODE", "");
}

export function getMetaLeadsEmail() {
  return requireEnv("META_LEADS_EMAIL");
}

export function getCloudinaryCloudName() {
  return requireEnv("CLOUDINARY_CLOUD_NAME");
}

export function getCloudinaryCategoryUploadPreset() {
  return requireEnv("CLOUDINARY_CATEGORY_UPLOAD_PRESET");
}

export function getCloudinarySubcategoryUploadPreset() {
  return requireEnv("CLOUDINARY_SUBCATEGORY_UPLOAD_PRESET");
}

export function getCloudinaryUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${getCloudinaryCloudName()}/image/upload`;
}

export function getSalesAutoDeactivationEnabled() {
  return process.env.SALES_AUTO_DEACTIVATION === "true";
}
