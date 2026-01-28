// API endpoint to send product warning notifications to specific users
// POST /api/admin/send-product-warning

import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import UserNotification from "@/models/UserNotification";
import User from "@/models/User";
import Product from "@/models/Product";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { userIds, productIds, title, message } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "User IDs are required" },
        { status: 400 }
      );
    }

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    const expo = new Expo();
    const notifications = [];
    const pushMessages = [];

    // ✅ Fetch product names for better notification messages
    let productNamesMap = {};
    if (productIds && productIds.length > 0) {
      const validProductIds = productIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
      
      if (validProductIds.length > 0) {
        const products = await Product.find({ _id: { $in: validProductIds } })
          .select('_id name')
          .lean();
        
        products.forEach(p => {
          productNamesMap[p._id.toString()] = p.name;
        });
      }
    }

    // Group products by user
    const userProductsMap = {};
    if (productIds && productIds.length > 0 && userIds.length > 0) {
      // Fetch products with their userId to group them
      const validProductIds = productIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
      
      if (validProductIds.length > 0) {
        const products = await Product.find({ _id: { $in: validProductIds } })
          .select('_id name userId')
          .lean();
        
        products.forEach(p => {
          const pUserId = p.userId?.toString();
          if (pUserId && userIds.includes(pUserId)) {
            if (!userProductsMap[pUserId]) {
              userProductsMap[pUserId] = [];
            }
            userProductsMap[pUserId].push(p.name);
          }
        });
      }
    }

    // Create notifications for each user
    for (const userIdRaw of userIds) {
      // ✅ Convert userId to ObjectId properly
      let userId;
      if (typeof userIdRaw === 'string') {
        if (!mongoose.Types.ObjectId.isValid(userIdRaw)) {
          console.warn(`Invalid userId format: ${userIdRaw}`);
          continue;
        }
        userId = new mongoose.Types.ObjectId(userIdRaw);
      } else if (userIdRaw?._id) {
        userId = typeof userIdRaw._id === 'string' 
          ? new mongoose.Types.ObjectId(userIdRaw._id)
          : userIdRaw._id;
      } else if (mongoose.Types.ObjectId.isValid(userIdRaw)) {
        userId = userIdRaw;
      } else {
        console.warn(`Invalid userId format: ${JSON.stringify(userIdRaw)}`);
        continue;
      }

      // ✅ Create personalized message with product names for this user
      const userIdStr = userId.toString();
      const userProductNames = userProductsMap[userIdStr] || [];
      
      let personalizedMessage = message;
      if (userProductNames.length > 0) {
        if (userProductNames.length === 1) {
          personalizedMessage = `Your product "${userProductNames[0]}" is missing subcategory. Please update it immediately, otherwise our system will delete it.`;
        } else if (userProductNames.length <= 5) {
          const productList = userProductNames.map(name => `"${name}"`).join(", ");
          personalizedMessage = `Your products (${productList}) are missing subcategory. Please update them immediately, otherwise our system will delete them.`;
        } else {
          const firstFew = userProductNames.slice(0, 5).map(name => `"${name}"`).join(", ");
          const remaining = userProductNames.length - 5;
          personalizedMessage = `Your products (${firstFew} and ${remaining} more) are missing subcategory. Please update them immediately, otherwise our system will delete them.`;
        }
      }

      // Create notification in database
      const notification = await UserNotification.create({
        userId,
        title,
        message: personalizedMessage,
        type: "warning",
        productId: productIds && productIds.length > 0 && mongoose.Types.ObjectId.isValid(productIds[0])
          ? new mongoose.Types.ObjectId(productIds[0])
          : null,
        isRead: false,
      });

      notifications.push(notification);

      // Get user's push tokens for mobile notifications
      const user = await User.findById(userId.toString()).select("pushTokens fullname email");
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        for (const token of user.pushTokens) {
          if (Expo.isExpoPushToken(token)) {
            pushMessages.push({
              to: token,
              sound: "default",
              title: title,
              body: personalizedMessage, // Use personalized message with product names
              data: {
                type: "product_warning",
                notificationId: notification._id.toString(),
                productId: productIds && productIds.length > 0 ? productIds[0]?.toString() : null,
              },
            });
          }
        }
      }
    }

    // Send push notifications in chunks
    if (pushMessages.length > 0) {
      const chunks = expo.chunkPushNotifications(pushMessages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent to ${notifications.length} user(s)`,
      data: {
        notificationsCount: notifications.length,
        pushNotificationsSent: pushMessages.length,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error sending product warnings:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}
