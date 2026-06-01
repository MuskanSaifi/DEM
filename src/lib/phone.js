/** Normalize to +91XXXXXXXXXX when possible (India). */
export function normalizeIndianMobile(input) {
  const digits = (input || "").toString().replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length >= 10) return `+${digits}`;
  return "";
}

export function isValidIndianMobile(normalized) {
  const digits = (normalized || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91");
}
