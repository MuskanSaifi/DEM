import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import CallSession from "@/models/dem-calling/CallSession";

export async function POST(req) {
  const roomId = req.nextUrl.searchParams.get("roomId");
  const callStatus = (await req.formData()).get("CallStatus");

  if (roomId && ["completed", "failed", "no-answer", "busy", "canceled"].includes(callStatus)) {
    try {
      await connectdb();
      await CallSession.updateOne(
        { roomId, status: "active" },
        { $set: { twilioClientStatus: callStatus } }
      );
    } catch {
      /* ignore */
    }
  }

  return new NextResponse("", { status: 200 });
}
