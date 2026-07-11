import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import CallSession from "@/models/dem-calling/CallSession";
import { verifyCallingToken } from "@/lib/dem-calling/auth";
import {
  dialClientIntoConference,
  isTwilioConfigured,
  toE164,
} from "@/lib/dem-calling/twilio";

export async function POST(req) {
  try {
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        { success: false, message: "Twilio not configured" },
        { status: 503 }
      );
    }

    const user = await verifyCallingToken(req, ["sales-employee"]);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, callId } = await req.json();
    if (!roomId) {
      return NextResponse.json({ success: false, message: "roomId required" }, { status: 400 });
    }

    await connectdb();
    const call = await CallSession.findOne({
      _id: callId || undefined,
      roomId,
      agentId: user.id,
      status: "active",
    });

    if (!call) {
      return NextResponse.json({ success: false, message: "Active call not found" }, { status: 404 });
    }

    if (call.twilioClientCallSid) {
      return NextResponse.json({
        success: true,
        message: "Client already dialed",
        callSid: call.twilioClientCallSid,
      });
    }

    const mobile = call.clientMobile;
    if (!toE164(mobile)) {
      return NextResponse.json(
        { success: false, message: "Valid client mobile required" },
        { status: 400 }
      );
    }

    const twilioCall = await dialClientIntoConference(roomId, mobile);
    call.twilioClientCallSid = twilioCall.sid;
    await call.save();

    return NextResponse.json({
      success: true,
      callSid: twilioCall.sid,
      message: "Client ko phone call ja rahi hai",
    });
  } catch (error) {
    console.error("Dial client error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Dial failed" },
      { status: 500 }
    );
  }
}
