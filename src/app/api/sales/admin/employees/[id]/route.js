import SalesEmployee from "@/models/SalesEmployee";
import SalesLead from "@/models/SalesLead";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

    // Check if employee exists
    const employee = await SalesEmployee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // Unassign all leads assigned to this employee
    await SalesLead.updateMany(
      { assignedTo: id },
      { $set: { assignedTo: null } }
    );

    // Delete employee
    await SalesEmployee.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Employee deleted successfully. All assigned leads are now unassigned.",
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

// PATCH - Update employee (deactivate/activate)
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
    const { isActive } = await req.json();

    const employee = await SalesEmployee.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        employee,
        message: `Employee ${isActive ? "activated" : "deactivated"} successfully`,
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
