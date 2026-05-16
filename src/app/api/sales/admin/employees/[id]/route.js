import SalesEmployee from "@/models/SalesEmployee";
import SalesLead from "@/models/SalesLead";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

async function verifyAdmin(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    if (decoded.role !== "sales-admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

// DELETE - Delete sales employee
export async function DELETE(req, { params }) {
  try {
    await connectdb();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reassignTo } = body;

    if (!reassignTo) {
      return NextResponse.json(
        {
          success: false,
          message: "Select a team member to reassign all leads before deleting.",
        },
        { status: 400 }
      );
    }

    if (String(reassignTo) === String(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot reassign leads to the same employee being deleted.",
        },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await SalesEmployee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    const targetEmployee = await SalesEmployee.findById(reassignTo);
    if (!targetEmployee) {
      return NextResponse.json(
        { success: false, message: "Selected team member not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const reassignResult = await SalesLead.updateMany(
      {
        $or: [
          { assignedTo: id },
          {
            createdBy: id,
            $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
          },
        ],
      },
      {
        $set: {
          assignedTo: reassignTo,
          assignedAt: now,
          assignedBy: admin.id,
        },
      }
    );

    // Delete employee
    await SalesEmployee.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: `Employee deleted. ${reassignResult.modifiedCount} lead(s) reassigned to ${targetEmployee.fullname}.`,
        reassignedCount: reassignResult.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Employee Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update employee (deactivate/activate, or change password)
export async function PATCH(req, { params }) {
  try {
    await connectdb();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive, password } = body;

    const update = {};

    if (typeof isActive === "boolean") {
      update.isActive = isActive;
    }

    if (password && typeof password === "string") {
      const trimmed = password.trim();
      if (trimmed.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      update.password = await bcrypt.hash(trimmed, 10);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid update fields provided" },
        { status: 400 }
      );
    }

    const employee = await SalesEmployee.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).select("-password");

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    const messages = [];
    if (typeof isActive === "boolean")
      messages.push(`Employee ${isActive ? "activated" : "deactivated"} successfully`);
    if (password) messages.push("Password changed. Employee must use new password to login.");

    return NextResponse.json(
      {
        success: true,
        employee,
        message: messages.join(" "),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Employee Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
