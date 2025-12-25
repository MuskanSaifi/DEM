import connectdb from "@/lib/dbConnect";
import SupportPerson from "@/models/SupportPerson";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectdb();

    const { email, password } = await req.json();

    const supportPerson = await SupportPerson.findOne({ email });
    if (!supportPerson || !(await supportPerson.matchPassword(password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(supportPerson._id);
    const response = NextResponse.json({ success: true, supportPerson }, { status: 200 });

    response.cookies.set("supportToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
