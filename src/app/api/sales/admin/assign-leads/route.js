import SalesLead from "@/models/SalesLead";
import { getJwtSecret } from "@/lib/env";
import SalesEmployee from "@/models/SalesEmployee";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

async function verifyAdmin(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      getJwtSecret()
    );
    if (decoded.role !== "sales-admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

// POST - Assign multiple leads to a sales employee
export async function POST(req) {
  try {
    await connectdb();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { leadIds, assignedTo } = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lead IDs array required" },
        { status: 400 }
      );
    }

    if (!assignedTo) {
      return NextResponse.json(
        { success: false, message: "Assigned to employee ID required" },
        { status: 400 }
      );
    }

    // Validate employee exists
    const employee = await SalesEmployee.findById(assignedTo);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // Convert string IDs to ObjectId (MongoDB handles this automatically, but we validate)
    const validLeadIds = leadIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validLeadIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid lead IDs provided" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return NextResponse.json(
        { success: false, message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Check how many leads actually exist
    const existingLeadsCount = await SalesLead.countDocuments({
      _id: { $in: validLeadIds },
    });

    if (existingLeadsCount === 0) {
      return NextResponse.json(
        { success: false, message: "No valid leads found to assign" },
        { status: 404 }
      );
    }

    const now = new Date();
    // Update leads (MongoDB will auto-convert string IDs to ObjectId)
    const result = await SalesLead.updateMany(
      { _id: { $in: validLeadIds } },
      {
        $set: {
          assignedTo,
          assignedAt: now,
          assignedBy: admin.id,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No leads were updated. They may already be assigned to this employee.",
        },
        { status: 400 }
      );
    }

    // Fetch updated leads
    const leads = await SalesLead.find({ _id: { $in: validLeadIds } })
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email");

    return NextResponse.json(
      {
        success: true,
        message: `${result.modifiedCount} of ${validLeadIds.length} leads assigned successfully`,
        leads,
        modifiedCount: result.modifiedCount,
        totalRequested: validLeadIds.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assign Leads Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
