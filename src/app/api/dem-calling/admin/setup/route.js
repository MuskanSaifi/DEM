import CallingAdmin from "@/models/dem-calling/CallingAdmin";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectdb();

    const existing = await CallingAdmin.countDocuments();
    if (existing > 0) {
      return NextResponse.json(
        { success: false, message: "Admin already exists. Use login." },
        { status: 400 }
      );
    }

    const { fullname, email, password } = await req.json();
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Fullname, email and password required" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await CallingAdmin.create({
      fullname,
      email: email.toLowerCase(),
      password: hashed,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Calling admin created. Please login.",
        admin: { id: admin._id, fullname: admin.fullname, email: admin.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Calling Admin Setup Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
