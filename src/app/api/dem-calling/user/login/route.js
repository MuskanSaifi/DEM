import CallingAgent from "@/models/dem-calling/CallingAgent";
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

    const agent = await CallingAgent.findOne({ email: email.toLowerCase() });
    if (!agent || !agent.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, agent.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signCallingToken({
      id: agent._id,
      email: agent.email,
      role: "calling-agent",
    });

    return NextResponse.json({
      success: true,
      token,
      agent: {
        id: agent._id,
        fullname: agent.fullname,
        email: agent.email,
        mobile: agent.mobile,
      },
    });
  } catch (error) {
    console.error("Calling Agent Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
