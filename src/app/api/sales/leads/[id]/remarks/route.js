import SalesLead from "@/models/SalesLead";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function verifyToken(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch {
    return null;
  }
}

// POST - Add remark to lead
export async function POST(req, { params }) {
  try {
    await connectdb();

    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { remark, remarkType } = await req.json();

    if (!remark) {
      return NextResponse.json(
        { success: false, message: "Remark required" },
        { status: 400 }
      );
    }

    const lead = await SalesLead.findById(id);
    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    lead.remarks.push({
      remark,
      remarkType: remarkType || "general", // general, call, email, meeting, etc.
      addedBy: user.id,
      addedByType: user.role === "sales-admin" ? "SalesAdmin" : "SalesEmployee",
    });

    await lead.save();

    const populatedLead = await SalesLead.findById(lead._id)
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email")
      .populate("remarks.addedBy", "fullname email");

    return NextResponse.json(
      { success: true, lead: populatedLead },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add Remark Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
