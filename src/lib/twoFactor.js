/**
 * 2Factor.in OTP helpers
 * - Login OTP: V1 SMS API (OTP templates on OTP service)
 * - GRC OTP: TRANS_SMS (DLT SMS route) — avoids voice-call delivery from OTP service
 */

import {
  getTwoFactorApiKey,
  getTwoFactorOtpTemplate,
  getTwoFactorSenderId,
  getTwoFactorGrcTemplate,
  getTwoFactorGrcSmsFallbackTemplate,
} from "@/lib/env";

export function formatMobileFor2Factor(mobileNumber) {
  const digits = (mobileNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

export function maskMobileNumber(mobileNumber) {
  const digits = (mobileNumber || "").replace(/\D/g, "");
  if (digits.length < 4) return "registered mobile";
  return `******${digits.slice(-4)}`;
}

/**
 * DLT transactional SMS — same route as working login templates (SMS only, not voice).
 * API: GET https://2factor.in/API/R1/?module=TRANS_SMS&apikey=...&to=...&from=...&templatename=...&var1=OTP
 */
export async function send2FactorTransactionalSms(mobileNumber, otp, templateName) {
  const apiKey = getTwoFactorApiKey();
  const from = getTwoFactorSenderId();
  const formattedMobile = formatMobileFor2Factor(mobileNumber);

  if (!formattedMobile || formattedMobile.length < 12) {
    return { ok: false, error: "Invalid mobile number" };
  }

  const params = new URLSearchParams({
    module: "TRANS_SMS",
    apikey: apiKey,
    to: formattedMobile,
    from,
    templatename: templateName,
    var1: String(otp),
  });

  const url = `https://2factor.in/API/R1/?${params.toString()}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result.Status === "Success") {
      return { ok: true, details: result.Details, channel: "sms" };
    }

    const details = String(result.Details || result.Message || "");
    console.error("2Factor TRANS_SMS error:", { templateName, result });

    const notOnSmsRoute =
      /incorrect sender|templatename/i.test(details) ||
      /template/i.test(details);

    return {
      ok: false,
      error: details || "Failed to send SMS",
      notOnSmsRoute,
    };
  } catch (err) {
    console.error("2Factor TRANS_SMS API error:", err);
    return { ok: false, error: "Failed to send SMS" };
  }
}

/**
 * GRC certificate OTP — must use TRANS_SMS so 2Factor does not place a voice call.
 */
export async function send2FactorGrcOtp(mobileNumber, otp) {
  const grcTemplate = getTwoFactorGrcTemplate();
  let sent = await send2FactorTransactionalSms(mobileNumber, otp, grcTemplate);

  if (!sent.ok && sent.notOnSmsRoute) {
    const fallback = getTwoFactorGrcSmsFallbackTemplate();
    if (fallback && fallback !== grcTemplate) {
      console.warn(
        `GRC template "${grcTemplate}" not on SMS route; trying fallback "${fallback}"`
      );
      sent = await send2FactorTransactionalSms(mobileNumber, otp, fallback);
      if (sent.ok) {
        return {
          ...sent,
          usedFallbackTemplate: true,
        };
      }
    }

    return {
      ok: false,
      error:
        `SMS template "${grcTemplate}" is not on 2Factor DLT SMS route yet. ` +
        `Set TWO_FACTOR_GRC_SMS_FALLBACK=OTPtemplate in .env for temporary SMS, ` +
        `or ask 2Factor to enable "${grcTemplate}" for Transactional SMS (same as OTPtemplate).`,
      notOnSmsRoute: true,
    };
  }

  return sent;
}

/**
 * Login / register OTP (V1 SMS API).
 * @param {string} [templateName] — defaults to TWO_FACTOR_OTP_TEMPLATE
 */
export async function send2FactorOtp(mobileNumber, otp, templateName) {
  const apiKey = getTwoFactorApiKey();
  const template = templateName || getTwoFactorOtpTemplate();

  const formattedMobile = formatMobileFor2Factor(mobileNumber);
  if (!formattedMobile || formattedMobile.length < 12) {
    return { ok: false, error: "Invalid mobile number" };
  }

  const encodedTemplate = encodeURIComponent(template);
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${formattedMobile}/${otp}/${encodedTemplate}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const result = await response.json().catch(() => ({}));
    const details = String(result.Details || "");

    if (response.ok && result.Status === "Success") {
      if (/voice/i.test(details)) {
        console.warn("2Factor OTP API may have used voice delivery.", { template, details });
      }
      return {
        ok: true,
        details: result.Details,
        channel: /voice/i.test(details) ? "voice" : "sms",
      };
    }

    console.error("2Factor send error:", result);
    return {
      ok: false,
      error: result.Details || result.Message || "Failed to send OTP",
    };
  } catch (err) {
    console.error("2Factor API error:", err);
    return { ok: false, error: "Failed to send OTP" };
  }
}
