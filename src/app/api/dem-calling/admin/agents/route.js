import CallingAgent from "@/models/dem-calling/CallingAgent";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyCallingToken } from "@/lib/dem-calling/auth";

export async function GET(req) {
  try {
    await connectdb();
    const admin = await verifyCallingToken(req, ["calling-admin"]);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const agents = await CallingAgent.find({ createdBy: admin.id })
      .select("-password")
      .sort({ fullname: 1 });

    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error("Get Calling Agents Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const admin = await verifyCallingToken(req, ["calling-admin"]);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fullname, email, password, mobile } = await req.json();
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Fullname, email and password required" },
        { status: 400 }
      );
    }

    const existing = await CallingAgent.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Agent with this email already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const agent = await CallingAgent.create({
      fullname,
      email: email.toLowerCase(),
      password: hashed,
      mobile: mobile || "",
      createdBy: admin.id,
    });

    return NextResponse.json(
      {
        success: true,
        agent: {
          id: agent._id,
          fullname: agent.fullname,
          email: agent.email,
          mobile: agent.mobile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Calling Agent Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
