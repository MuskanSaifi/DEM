import CallingAdmin from "@/models/dem-calling/CallingAdmin";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signCallingToken } from "@/lib/dem-calling/auth";

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

    const admin = await CallingAdmin.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signCallingToken({
      id: admin._id,
      email: admin.email,
      role: "calling-admin",
    });

    return NextResponse.json({
      success: true,
      token,
      admin: { id: admin._id, fullname: admin.fullname, email: admin.email },
    });
  } catch (error) {
    console.error("Calling Admin Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
