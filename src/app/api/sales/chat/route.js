import SalesChat from "@/models/SalesChat";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function verifyToken(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch {
    return null;
  }
}

// GET - Get chat messages
export async function GET(req) {
  try {
    await connectdb();

    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get("with");
    const leadId = searchParams.get("leadId");

    let query = {
      $or: [
        { from: user.id, to: withUserId },
        { from: withUserId, to: user.id },
      ],
    };

    if (leadId) {
      query.leadId = leadId;
    }

    const messages = await SalesChat.find(query)
      .populate("from", "fullname email")
      .populate("to", "fullname email")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await SalesChat.updateMany(
      { to: user.id, from: withUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error("Get Chat Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send message
export async function POST(req) {
  try {
    await connectdb();

    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { to, message, leadId, toType } = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: "To and message required" },
        { status: 400 }
      );
    }

    const chat = await SalesChat.create({
      from: user.id,
      fromType: user.role === "sales-admin" ? "SalesAdmin" : "SalesEmployee",
      to,
      toType: toType || (user.role === "sales-admin" ? "SalesEmployee" : "SalesAdmin"),
      message,
      leadId: leadId || null,
    });

    const populatedChat = await SalesChat.findById(chat._id)
      .populate("from", "fullname email")
      .populate("to", "fullname email");

    return NextResponse.json(
      { success: true, message: populatedChat },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send Chat Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
