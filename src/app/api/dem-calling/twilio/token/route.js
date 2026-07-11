import { NextResponse } from "next/server";
import { verifyCallingToken } from "@/lib/dem-calling/auth";
import {
  createVoiceAccessToken,
  isTwilioConfigured,
} from "@/lib/dem-calling/twilio";

export async function GET(req) {
  try {
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        { success: false, message: "Twilio not configured" },
        { status: 503 }
      );
    }

    const user = await verifyCallingToken(req, ["sales-admin", "sales-employee"]);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || user.role;
    const identity = `${role}-${user.id}`;

    const token = createVoiceAccessToken(identity);

    return NextResponse.json({ success: true, token, identity });
  } catch (error) {
    console.error("Twilio token error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Token failed" },
      { status: 500 }
    );
  }
}
