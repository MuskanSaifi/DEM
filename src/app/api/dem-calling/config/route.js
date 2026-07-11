import { NextResponse } from "next/server";
import { verifyCallingToken } from "@/lib/dem-calling/auth";
import { isTwilioConfigured } from "@/lib/dem-calling/twilio";

export async function GET() {
  return NextResponse.json({
    success: true,
    twilioEnabled: isTwilioConfigured(),
    callingMode: isTwilioConfigured() ? "twilio" : "mic-only",
  });
}
