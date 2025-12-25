// app/api/userprofile/save-push-token/route.js

import connectdb from "@/lib/dbConnect";
import PushToken from "@/models/PushToken"; // Adjust path if needed
import { NextResponse } from 'next/server'; // Import NextResponse for App Router responses

export async function POST(request) {
  try {
    await connectdb();

    const { userId, pushToken } = await request.json();

    if (!userId || !pushToken) {
      return NextResponse.json(
        { success: false, message: "User ID and Push Token are required" },
        { status: 400 }
      );
    }

    // Upsert: Find by userId, if exists, update token, otherwise create new
    const result = await PushToken.findOneAndUpdate(
      { userId: userId },
      { token: pushToken },
      { upsert: true, new: true, setDefaultsOnInsert: true } // `new: true` returns the updated doc, `upsert: true` creates if not found
    );

    console.log(`Push token for user ${userId} saved/updated.`);
    return NextResponse.json({ success: true, message: "Push token saved successfully" });

  } catch (error) {
    console.error("Error saving push token:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}