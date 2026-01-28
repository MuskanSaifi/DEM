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

// POST - Bulk import leads from array
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

    const { leads, assignedTo } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, message: "Leads array required" },
        { status: 400 }
      );
    }

    // Handle assignedTo - convert empty string to null
    const assignedToId = assignedTo && assignedTo.trim() !== "" ? assignedTo : null;

    // Validate and format leads
    const formattedLeads = leads
      .map((lead) => {
        // Handle different column name variations
        const clientName =
          lead["CLIENT NAME"] ||
          lead["Client Name"] ||
          lead.clientName ||
          lead["CLIENTNAME"] ||
          "";
        const companyName =
          lead["COMPANY NAME"] ||
          lead["Company Name"] ||
          lead.companyName ||
          lead["COMPANYNAME"] ||
          "";
        const mobile =
          lead["MOBILE"] ||
          lead["Mobile"] ||
          lead.mobile ||
          lead["MOBILENUMBER"] ||
          "";
        const email =
          lead["Email"] ||
          lead["EMAIL"] ||
          lead.email ||
          "";
        const state =
          lead["STATE"] ||
          lead["State"] ||
          lead.state ||
          "";
        const product =
          lead["PRODUCT"] ||
          lead["Product"] ||
          lead.product ||
          lead["PRODUCT (description)"] ||
          lead["PRODUCT(description)"] ||
          "";

        // Required fields validation
        if (!clientName || !mobile || !product) {
          return null; // Skip invalid rows
        }

        return {
          clientName: clientName.trim(),
          companyName: companyName?.trim() || "",
          mobile: mobile.toString().trim(),
          email: email?.trim() || "",
          state: state?.trim() || "",
          product: product.trim(),
          status: "new",
          assignedTo: assignedToId,
          assignedAt: assignedToId ? new Date() : null,
          assignedBy: assignedToId ? admin.id : null,
          createdBy: admin.id,
        };
      })
      .filter((lead) => lead !== null); // Remove invalid entries

    if (formattedLeads.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid leads found" },
        { status: 400 }
      );
    }

    // Insert all leads
    const insertedLeads = await SalesLead.insertMany(formattedLeads);

    const populatedLeads = await SalesLead.find({
      _id: { $in: insertedLeads.map((l) => l._id) },
    })
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email");

    return NextResponse.json(
      {
        success: true,
        message: `${insertedLeads.length} leads imported successfully`,
        leads: populatedLeads,
        imported: insertedLeads.length,
        skipped: leads.length - insertedLeads.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
