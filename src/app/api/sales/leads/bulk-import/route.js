import SalesLead from "@/models/SalesLead";
import { getJwtSecret } from "@/lib/env";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

function normalizeMobile(m) {
  if (!m || typeof m !== "string") return "";
  return m.replace(/\D/g, "").trim();
}

async function verifyImportUser(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret());

    if (decoded.role !== "sales-admin" && decoded.role !== "sales-employee") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function formatLeadRow(lead) {
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
    lead["MOBILE NUMBER"] ||
    "";

  const email =
    lead["Email"] || lead["EMAIL"] || lead.email || "";

  const state =
    lead["STATE"] || lead["State"] || lead.state || "";

  const product =
    lead["PRODUCT"] ||
    lead["Product"] ||
    lead.product ||
    lead["PRODUCT (description)"] ||
    lead["PRODUCT(description)"] ||
    "";

  if (!clientName || !mobile) return null;

  return {
    clientName: clientName.toString().trim(),
    companyName: companyName ? companyName.toString().trim() : "",
    mobile: mobile.toString().trim(),
    email: email ? email.toString().trim() : "",
    state: state ? state.toString().trim() : "",
    product: product ? product.toString().trim() : "Not specified",
  };
}

// POST - Bulk import leads from array
export async function POST(req) {
  try {
    await connectdb();

    const user = await verifyImportUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const isEmployee = user.role === "sales-employee";
    const { leads, assignedTo, markAsPaid } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, message: "Leads array required" },
        { status: 400 }
      );
    }

    const assignedToId = isEmployee
      ? user.id
      : assignedTo && assignedTo.trim() !== ""
        ? assignedTo
        : null;

    const importBatchId = crypto.randomUUID();
    const importedAt = new Date();

    const formattedLeads = leads
      .map(formatLeadRow)
      .filter((lead) => lead !== null);

    if (formattedLeads.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid leads found" },
        { status: 400 }
      );
    }

    const existing = await SalesLead.find({}, { mobile: 1, email: 1 }).lean();
    const existingMobileSet = new Set(
      existing.map((l) => normalizeMobile(l.mobile)).filter(Boolean)
    );
    const existingEmailSet = new Set(
      existing
        .map((l) =>
          l.email && l.email.trim() ? l.email.trim().toLowerCase() : null
        )
        .filter(Boolean)
    );

    const toInsert = [];
    const duplicateLeads = [];
    const skippedDuplicates = { mobile: 0, email: 0, inSheet: 0 };

    for (const lead of formattedLeads) {
      const mobNorm = normalizeMobile(lead.mobile);
      const emailNorm = lead.email ? lead.email.trim().toLowerCase() : "";

      let reason = null;
      if (existingMobileSet.has(mobNorm)) {
        reason = "Same mobile already exists in database";
        skippedDuplicates.mobile++;
      } else if (emailNorm && existingEmailSet.has(emailNorm)) {
        reason = "Same email already exists in database";
        skippedDuplicates.email++;
      }

      if (reason) {
        duplicateLeads.push({
          clientName: lead.clientName,
          companyName: lead.companyName,
          mobile: lead.mobile,
          email: lead.email,
          state: lead.state,
          product: lead.product,
          reason,
        });
        continue;
      }

      toInsert.push({
        ...lead,
        status: "new",
        paymentStatus: markAsPaid ? "paid" : "pending",
        paidMarkedAt: markAsPaid ? new Date() : null,
        paidMarkedBy: markAsPaid && isEmployee ? user.id : markAsPaid && assignedToId ? assignedToId : null,
        assignedTo: assignedToId,
        assignedAt: assignedToId ? new Date() : null,
        assignedBy: !isEmployee && assignedToId ? user.id : null,
        // Admin sheet assign: attribute ownership to employee so history/stats work
        createdBy: isEmployee ? user.id : assignedToId || user.id,
        source: "bulk_import",
        importBatchId,
        importedAt,
      });

      if (mobNorm) existingMobileSet.add(mobNorm);
      if (emailNorm) existingEmailSet.add(emailNorm);
    }

    let insertedLeads = [];
    if (toInsert.length > 0) {
      insertedLeads = await SalesLead.insertMany(toInsert);
    }

    const populatedLeads =
      insertedLeads.length > 0
        ? await SalesLead.find({
            _id: { $in: insertedLeads.map((l) => l._id) },
          })
            .populate("assignedTo", "fullname email")
            .populate("createdBy", "fullname email")
        : [];

    const totalSkipped = duplicateLeads.length;
    let message;
    if (insertedLeads.length === 0) {
      message =
        "Koi naya lead upload nahi hua. Saare records duplicate hain (pehle se database mein maujood).";
    } else {
      message = `${insertedLeads.length} leads imported successfully`;
      if (totalSkipped > 0) {
        message += `. ${totalSkipped} duplicate row(s) skip kiye gaye.`;
      }
    }
    if (leads.length - formattedLeads.length > 0) {
      message += ` ${leads.length - formattedLeads.length} invalid row(s) skipped.`;
    }

    return NextResponse.json(
      {
        success: true,
        message,
        leads: populatedLeads,
        imported: insertedLeads.length,
        skipped: totalSkipped,
        skippedDuplicates,
        duplicateLeads,
        importBatchId: insertedLeads.length > 0 ? importBatchId : null,
        importedAt: insertedLeads.length > 0 ? importedAt : null,
      },
      { status: insertedLeads.length > 0 ? 201 : 200 }
    );
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
