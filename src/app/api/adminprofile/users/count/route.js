// app/api/adminprofile/users/count/route.js (New dedicated file)

import User from "@/models/User";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectdb();
    
    // Only count the total number of documents
    const totalUsers = await User.countDocuments(); 

    return NextResponse.json({
      success: true,
      totalUsers: totalUsers, // Using the simple key 'totalUsers' here
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching user count for dashboard:", error);
    return NextResponse.json({
      success: false,
      totalUsers: 0,
      message: `Internal Server Error: ${error.message}`,
    }, { status: 500 });
  }
}