import { NextResponse } from "next/server";
import { conferenceTwiml } from "@/lib/dem-calling/twilio";

/** Twilio TwiML App webhook — agent/admin browser join */
export async function POST(req) {
  try {
    const form = await req.formData();
    const conferenceName =
      form.get("conferenceName") ||
      form.get("conference") ||
      req.nextUrl.searchParams.get("conference") ||
      "";
    const role = form.get("role") || req.nextUrl.searchParams.get("role") || "agent";

    if (!conferenceName) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Conference missing</Say></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    return new NextResponse(conferenceTwiml(String(conferenceName), String(role)), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Twilio voice TwiML error:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Error</Say></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}

export async function GET(req) {
  return POST(req);
}
