import CallSession from "@/models/dem-calling/CallSession";
import SalesEmployee from "@/models/SalesEmployee";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { verifyCallingToken } from "@/lib/dem-calling/auth";
import { isTwilioConfigured } from "@/lib/dem-calling/twilio";

const STALE_CALL_MS = 4 * 60 * 60 * 1000;

async function closeStaleActiveCalls(agentId) {
  const cutoff = new Date(Date.now() - STALE_CALL_MS);
  await CallSession.updateMany(
    { agentId, status: "active", startedAt: { $lt: cutoff } },
    { $set: { status: "ended", endedAt: new Date() } }
  );
}

export async function GET(req) {
  try {
    await connectdb();
    const user = await verifyCallingToken(req, ["sales-admin", "sales-employee"]);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";

    const query = { status };
    if (user.role === "sales-employee") {
      query.agentId = user.id;
    }

    const calls = await CallSession.find(query)
      .populate("agentId", "fullname email mobile")
      .sort({ startedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, calls });
  } catch (error) {
    console.error("Get Calls Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const agent = await verifyCallingToken(req, ["sales-employee"]);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Unauthorized — sales team login required" },
        { status: 401 }
      );
    }

    await closeStaleActiveCalls(agent.id);

    const { clientName, clientMobile, leadId, forceEndPrevious } = await req.json();

    if (forceEndPrevious) {
      await CallSession.updateMany(
        { agentId: agent.id, status: "active" },
        { $set: { status: "ended", endedAt: new Date() } }
      );
    }

    const activeCall = await CallSession.findOne({
      agentId: agent.id,
      status: "active",
    });
    if (activeCall) {
      return NextResponse.json(
        {
          success: false,
          message: "Pehle se ek active call hai — End Call karein ya dubara try karein",
          call: activeCall,
          code: "ACTIVE_CALL_EXISTS",
        },
        { status: 400 }
      );
    }

    const agentDoc = await SalesEmployee.findById(agent.id).select("fullname mobile");
    const safeLeadId =
      leadId && mongoose.Types.ObjectId.isValid(String(leadId)) ? leadId : null;

    const roomId = crypto.randomUUID();
    const twilioOn = isTwilioConfigured();
    const call = await CallSession.create({
      agentId: agent.id,
      agentName: agentDoc?.fullname || "",
      clientName: clientName?.trim() || "Client",
      clientMobile: clientMobile?.trim() || agentDoc?.mobile || "",
      leadId: safeLeadId,
      roomId,
      status: "active",
      callingMode: twilioOn ? "twilio" : "mic-only",
    });

    return NextResponse.json(
      {
        success: true,
        call,
        twilioEnabled: twilioOn,
        callingMode: twilioOn ? "twilio" : "mic-only",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Start Call Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
