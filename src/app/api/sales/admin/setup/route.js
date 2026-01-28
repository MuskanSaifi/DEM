import SalesAdmin from "@/models/SalesAdmin";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * ONE-TIME SETUP: Create first Sales Admin
 * Run this once to create the initial admin account
 * Then delete this file or protect it
 */
export async function POST(req) {
  try {
    await connectdb();

    // Check if admin already exists
    const existing = await SalesAdmin.findOne();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Admin already exists. Use login instead." },
        { status: 400 }
      );
    }

    const { fullname, email, password, mobileNumber } = await req.json();

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Fullname, email, and password required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await SalesAdmin.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobileNumber,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully. You can now login.",
        admin: {
          id: admin._id,
          fullname: admin.fullname,
          email: admin.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup Admin Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
