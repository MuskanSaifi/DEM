import SalesAdmin from "@/models/SalesAdmin";
import SalesEmployee from "@/models/SalesEmployee";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function verifyToken(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch {
    return null;
  }
}

/**
 * GET - List of people the current user can chat with.
 * - sales-admin → all active sales employees
 * - sales-employee → all active sales admins
 */
export async function GET(req) {
  try {
    await connectdb();

    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role === "sales-admin") {
      const contacts = await SalesEmployee.find({ isActive: true })
        .select("fullname email _id")
        .sort({ fullname: 1 });
      return NextResponse.json(
        { success: true, contacts: contacts.map((c) => ({ userId: c._id, user: { fullname: c.fullname, email: c.email } })) },
        { status: 200 }
      );
    }

    if (user.role === "sales-employee") {
      const contacts = await SalesAdmin.find({ isActive: true })
        .select("fullname email _id")
        .sort({ fullname: 1 });
      return NextResponse.json(
        { success: true, contacts: contacts.map((c) => ({ userId: c._id, user: { fullname: c.fullname, email: c.email } })) },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Chat contacts error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
