// API endpoint to fetch user notifications
// GET /api/userprofile/notifications

import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/requireSignIn";
import UserNotification from "@/models/UserNotification";

export async function GET(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all notifications for this user, sorted by newest first
    const userId = user.id || user._id;
    const notifications = await UserNotification.find({ userId })
      .sort({ createdAt: -1 })
      .populate("productId", "name productslug")
      .lean();

    // Count unread notifications
    const unreadCount = await UserNotification.countDocuments({
      userId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching user notifications:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}

// Mark notification as read
export async function PATCH(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { notificationId, markAllAsRead } = body;
    const userId = user.id || user._id;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await UserNotification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      }, { status: 200 });
    }

    if (notificationId) {
      // Mark specific notification as read
      await UserNotification.findOneAndUpdate(
        { _id: notificationId, userId },
        { $set: { isRead: true } }
      );
      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: "Notification ID or markAllAsRead required" },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Error updating notification:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}
