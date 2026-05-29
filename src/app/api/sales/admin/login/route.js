import SalesAdmin from "@/models/SalesAdmin";
import { getJwtSecret } from "@/lib/env";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const admin = await SalesAdmin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated" },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "sales-admin" },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        admin: {
          id: admin._id,
          fullname: admin.fullname,
          email: admin.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sales Admin Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
