import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import SupportPerson from "@/models/SupportPerson";

export async function POST(req) {
  try {
    await connectdb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const supportExists = await SupportPerson.findOne({ email });
    if (supportExists) {
      return NextResponse.json({ success: false, message: "Support already exists" }, { status: 400 });
    }

    const support = await SupportPerson.create({ email, password });

    const token = generateToken(support._id);
    const response = NextResponse.json({ success: true, support }, { status: 201 });
    response.cookies.set("supportToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
