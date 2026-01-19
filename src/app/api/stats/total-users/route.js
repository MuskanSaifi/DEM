import User from "@/models/User";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";

/**
 * Public API: returns total user count from DB (User collection only - sellers).
 * Header uses: display = 120000 + count
 */
export async function GET() {
  try {
    await connectdb();
    const count = await User.countDocuments();
    return NextResponse.json({ success: true, count });
  } catch (e) {
    console.error("stats total-users error:", e);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
