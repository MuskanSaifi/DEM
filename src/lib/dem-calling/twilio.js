import twilio from "twilio";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export function isTwilioConfigured() {
  if (process.env.TWILIO_ENABLED !== "true") return false;
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_API_KEY_SID &&
    process.env.TWILIO_API_SECRET &&
    process.env.TWILIO_TWIML_APP_SID &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

export function getWebhookBaseUrl() {
  return (
    process.env.TWILIO_WEBHOOK_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  ).replace(/\/$/, "");
}

export function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/** India / generic mobile → E.164 */
export function toE164(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return null;
}

export function createVoiceAccessToken(identity) {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_SECRET,
    { identity: String(identity), ttl: 3600 }
  );

  const grant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: false,
  });
  token.addGrant(grant);
  return token.toJwt();
}

export function conferenceTwiml(conferenceName, role = "agent") {
  const isAgent = role === "agent";
  const muted = role === "admin" ? "true" : "false";
  const startOnEnter = isAgent ? "true" : "false";
  const endOnExit = isAgent ? "true" : "false";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference
      beep="false"
      muted="${muted}"
      startConferenceOnEnter="${startOnEnter}"
      endConferenceOnExit="${endOnExit}"
      waitUrl=""
    >${conferenceName}</Conference>
  </Dial>
</Response>`;
}

export async function dialClientIntoConference(roomId, clientMobile) {
  const base = getWebhookBaseUrl();
  if (!base) {
    throw new Error("TWILIO_WEBHOOK_BASE_URL set karein (public URL, e.g. ngrok)");
  }

  const to = toE164(clientMobile);
  if (!to) throw new Error("Valid client mobile number required");

  const client = getTwilioClient();
  return client.calls.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `${base}/api/dem-calling/twilio/client-twiml?conference=${encodeURIComponent(roomId)}`,
    statusCallback: `${base}/api/dem-calling/twilio/status?roomId=${encodeURIComponent(roomId)}`,
    statusCallbackEvent: ["completed", "failed", "no-answer", "busy"],
    method: "POST",
  });
}
