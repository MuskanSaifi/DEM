import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth"; // Ensure correct import

export async function GET(req) {
  try {
    const token = req.cookies.get("supportToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 });
    }

    return NextResponse.json({ success: true, supportId: decoded.id });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
