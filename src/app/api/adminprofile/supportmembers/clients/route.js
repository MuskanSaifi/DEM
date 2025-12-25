
import User from "@/models/User";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectdb(); // ✅ Ensure DB connection

    // ✅ Fetch all users with their associated products
    const users = await User.find().select("-products")



    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      users,
      totalUsers: users.length, // ✅ Add total users count
    }, { status: 200 });


  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({
       success: false, 
       totalUsers: 0,
       message: `Internal Server Error: ${error.message}` },
       { status: 500 });
  }
}

