import SalesLead from "@/models/SalesLead";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function normalizeMobile(m) {
  if (!m || typeof m !== "string") return "";
  return m.replace(/\D/g, "").trim();
}

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

// PATCH - Update lead (assign, status, add remark)
export async function PATCH(req, { params }) {
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
    const {
      assignedTo,
      status,
      remark,
      selfAssign,
      paymentStatus,
      gst,
      mobile,
      companyName,
    } = await req.json();

    const lead = await SalesLead.findById(id);
    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    // Update assignment
    if (selfAssign && user.role === "sales-employee") {
      lead.assignedTo = user.id;
      lead.assignedAt = new Date();
      lead.assignedBy = null;
    } else if (assignedTo && user.role === "sales-admin") {
      lead.assignedTo = assignedTo;
      lead.assignedAt = new Date();
      lead.assignedBy = user.id;
    }

    // Update status
    if (status) {
      lead.status = status;
    }

    if (
      paymentStatus &&
      ["pending", "paid", "partial", "not_applicable"].includes(paymentStatus)
    ) {
      lead.paymentStatus = paymentStatus;
    }

    if (gst !== undefined) {
      lead.gst = gst != null && String(gst).trim() ? String(gst).trim() : "";
    }

    if (companyName !== undefined) {
      lead.companyName = companyName != null ? String(companyName).trim() : "";
    }

    if (mobile !== undefined) {
      const trimmed = String(mobile).trim().replace(/\s+/g, "");
      if (!trimmed) {
        return NextResponse.json(
          { success: false, message: "Mobile is required" },
          { status: 400 }
        );
      }
      const mobileNorm = normalizeMobile(trimmed);
      const others = await SalesLead.find({ _id: { $ne: id } }, { mobile: 1 }).lean();
      const duplicate = others.some(
        (l) => normalizeMobile(l.mobile) === mobileNorm
      );
      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Another lead already uses this mobile number.",
          },
          { status: 400 }
        );
      }
      lead.mobile = trimmed;
    }

    // Add remark
    if (remark) {
      lead.remarks.push({
        remark,
        addedBy: user.id,
        addedByType: user.role === "sales-admin" ? "SalesAdmin" : "SalesEmployee",
      });
    }

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
    console.error("Update Lead Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
