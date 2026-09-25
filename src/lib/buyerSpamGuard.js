/** Bot pattern: user_<timestamp>_<random>@gmail.com */
export const FAKE_BUYER_EMAIL =
  /^user_\d+_[a-z0-9]+@gmail\.com$/i;

export const FAKE_EMAIL_MESSAGE =
  "Invalid email address. Please use a real email.";

export function isFakeBuyerEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) return false;
  return FAKE_BUYER_EMAIL.test(value);
}

export function assertValidBuyerEmail(email) {
  if (isFakeBuyerEmail(email)) {
    return { ok: false, error: FAKE_EMAIL_MESSAGE };
  }
  return { ok: true };
}
