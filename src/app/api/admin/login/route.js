  import Admin from "@/models/Admin";
  import { generateToken } from "@/lib/auth";
  import { NextResponse } from "next/server";
  import connectdb from "@/lib/dbConnect";

  export async function POST(req) {
    try {
      await connectdb();

      const { email, password } = await req.json();

      // ✅ Validate input
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      // ✅ Find admin
      const admin = await Admin.findOne({ email });
      if (!admin || !(await admin.matchPassword(password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // ✅ Generate JWT Token
      const token = generateToken(admin._id);

      // ✅ Send token in HTTP-only cookie
      const response = NextResponse.json(
        { success: true, admin: { _id: admin._id, email: admin.email, name: admin.name } },
        { status: 200 }
      );

      response.cookies.set("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    } catch (error) {
      console.error("❌ Admin login error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
