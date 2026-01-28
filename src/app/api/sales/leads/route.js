import SalesLead from "@/models/SalesLead";
import SalesEmployee from "@/models/SalesEmployee";
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

// GET - Get leads (with filters)
export async function GET(req) {
  try {
    await connectdb();

    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const employeeId = searchParams.get("employeeId");

    let query = {};

    // Sales Admin can see all leads
    if (user.role === "sales-admin") {
      if (status) query.status = status;
      if (assignedTo) query.assignedTo = assignedTo;
    } else {
      // Sales Employee can see their own leads and assigned leads
      query.$or = [
        { createdBy: user.id },
        { assignedTo: user.id },
      ];
      if (status) query.status = status;
    }

    if (employeeId) {
      query.$or = [
        { createdBy: employeeId },
        { assignedTo: employeeId },
      ];
    }

    const leads = await SalesLead.find(query)
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, leads }, { status: 200 });
  } catch (error) {
    console.error("Get Leads Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add new lead
export async function POST(req) {
  try {
    await connectdb();

    const user = await verifyToken(req);
    if (!user || user.role !== "sales-employee") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { clientName, companyName, mobile, email, state, product } =
      await req.json();

    if (!clientName || !mobile || !product) {
      return NextResponse.json(
        { success: false, message: "Client name, mobile, and product required" },
        { status: 400 }
      );
    }

    const lead = await SalesLead.create({
      clientName,
      companyName,
      mobile,
      email,
      state,
      product,
      createdBy: user.id,
    });

    const populatedLead = await SalesLead.findById(lead._id)
      .populate("createdBy", "fullname email");

    return NextResponse.json(
      { success: true, lead: populatedLead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Lead Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
