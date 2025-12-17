import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";

export const dynamic = "force-static";
export const revalidate = 60 * 60 * 24; // 24 hours

export async function GET() {
  try {
    await connectdb();

    const totalUsers = await User.countDocuments();

    return NextResponse.json(
      { success: true, totalUsers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching totalUsers:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
