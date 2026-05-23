import SalesEmployee from "@/models/SalesEmployee";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function verifyEmployee(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    if (decoded.role !== "sales-employee") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    await connectdb();
    const user = await verifyEmployee(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await SalesEmployee.findById(user.id).select(
      "isActive inactiveReason fullname"
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            employee.inactiveReason === "low_paid_activity"
              ? "Your account was deactivated: fewer than 2 leads marked paid in the last 7 days. Contact sales admin."
              : "Your account is deactivated.",
          inactiveReason: employee.inactiveReason,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, isActive: true }, { status: 200 });
  } catch (error) {
    console.error("Team performance check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
