import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import SupportPerson from "@/models/SupportPerson";

export async function POST(req) {
  try {
    await connectdb();
    const { email, password } = await req.json();

    const support = await SupportPerson.findOne({ email });
    if (!support || !(await support.matchPassword(password)))
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = generateToken(support._id);
    const response = NextResponse.json({ success: true, support }, { status: 200 });
    response.cookies.set("supportToken", token, { httpOnly: true, secure: true });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
