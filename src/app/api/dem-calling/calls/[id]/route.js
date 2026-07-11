import CallSession from "@/models/dem-calling/CallSession";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { verifyCallingToken } from "@/lib/dem-calling/auth";

export async function PATCH(req, { params }) {
  try {
    await connectdb();
    const user = await verifyCallingToken(req, ["sales-admin", "sales-employee"]);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const call = await CallSession.findById(id);
    if (!call) {
      return NextResponse.json(
        { success: false, message: "Call not found" },
        { status: 404 }
      );
    }

    if (user.role === "sales-employee" && String(call.agentId) !== String(user.id)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === "end") {
      call.status = "ended";
      call.endedAt = new Date();
      await call.save();
      return NextResponse.json({ success: true, call });
    }

    if (body.action === "monitor" && user.role === "sales-admin") {
      const already = call.monitoredBy.some(
        (m) => String(m.adminId) === String(user.id)
      );
      if (!already) {
        call.monitoredBy.push({ adminId: user.id, joinedAt: new Date() });
        await call.save();
      }
      return NextResponse.json({ success: true, call, roomId: call.roomId });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update Call Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
