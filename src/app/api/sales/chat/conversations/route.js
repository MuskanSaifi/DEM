import SalesChat from "@/models/SalesChat";
import SalesAdmin from "@/models/SalesAdmin";
import SalesEmployee from "@/models/SalesEmployee";
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

// GET - Get all conversations
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

    // Get unique conversation partners
    const conversations = await SalesChat.aggregate([
      {
        $match: {
          $or: [{ from: user.id }, { to: user.id }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", user.id] },
              "$to",
              "$from",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", user.id] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Populate user details
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const userId = conv._id;
        let userDetails = null;

        if (user.role === "sales-admin") {
          userDetails = await SalesEmployee.findById(userId).select(
            "fullname email"
          );
        } else {
          userDetails = await SalesAdmin.findById(userId).select(
            "fullname email"
          );
        }

        return {
          userId,
          user: userDetails,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    return NextResponse.json(
      { success: true, conversations: populatedConversations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Conversations Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
