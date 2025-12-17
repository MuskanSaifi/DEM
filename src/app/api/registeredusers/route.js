import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectdb();

    const totalUsers = await User.countDocuments();

    return NextResponse.json(
      { success: true, totalUsers },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching totalUsers:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
