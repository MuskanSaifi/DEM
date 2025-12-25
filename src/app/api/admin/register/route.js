import Admin from "@/models/Admin";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await connectdb();
    const { email, password } = await req.json();

    const adminExists = await Admin.findOne({ email });
    if (adminExists) return NextResponse.json({ error: "Admin already exists" }, { status: 400 });

    const admin = await Admin.create({ email, password });

    const token = generateToken(admin._id);
    const response = NextResponse.json({ success: true, admin }, { status: 201 });
    response.cookies.set("adminToken", token, { httpOnly: true, secure: true });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
