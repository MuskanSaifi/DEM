import SalesEmployee from "@/models/SalesEmployee";
import { getJwtSecret } from "@/lib/env";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  countPaidLeadsInWindow,
  getWeekStartDate,
  runWeeklyPerformanceCheck,
  WEEKLY_PAID_LEAD_MINIMUM,
} from "@/lib/salesWeeklyPerformance";

export async function POST(req) {
  try {
    await connectdb();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    const employee = await SalesEmployee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!employee.isActive) {
      const weekAgo = getWeekStartDate();
      const paidCount = await countPaidLeadsInWindow(employee._id, weekAgo);
      const message =
        employee.inactiveReason === "low_paid_activity"
          ? `Account deactivated automatically: only ${paidCount} lead(s) marked paid in the last 7 days (minimum ${WEEKLY_PAID_LEAD_MINIMUM}). Contact your sales admin to reactivate.`
          : "Account is deactivated. Contact your sales admin.";
      return NextResponse.json(
        { success: false, message, inactiveReason: employee.inactiveReason },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: employee._id, email: employee.email, role: "sales-employee" },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        employee: {
          id: employee._id,
          fullname: employee.fullname,
          email: employee.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sales Team Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
