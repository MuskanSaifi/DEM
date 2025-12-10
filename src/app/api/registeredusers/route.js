import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    await connectdb(); // Ensure DB connection

    const totalUsers = await User.countDocuments();

    return NextResponse.json({ success: true, totalUsers }, { status: 200 });

  } catch (error) {
    console.error("Error fetching totalUsers:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
