import SalesEmployee from "@/models/SalesEmployee";
import { getJwtSecret } from "@/lib/env";
import SalesAdmin from "@/models/SalesAdmin";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Verify admin token
async function verifyAdmin(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      getJwtSecret()
    );
    if (decoded.role !== "sales-admin") return null;

    return decoded;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectdb();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fullname, email, password, mobileNumber } = await req.json();

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Fullname, email, and password required" },
        { status: 400 }
      );
    }

    const existing = await SalesEmployee.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Employee with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await SalesEmployee.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobileNumber,
      createdBy: admin.id,
    });

    return NextResponse.json(
      {
        success: true,
        employee: {
          id: employee._id,
          fullname: employee.fullname,
          email: employee.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Employee Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
