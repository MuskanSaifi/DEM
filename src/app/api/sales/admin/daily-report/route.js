import SalesLead from "@/models/SalesLead";
import SalesEmployee from "@/models/SalesEmployee";
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

export async function GET(req) {
  try {
    await connectdb();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const today = new Date();
    const date = dateParam
      ? new Date(dateParam + "T00:00:00.000Z")
      : today;
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    const employees = await SalesEmployee.find({ isActive: true })
      .select("_id fullname email")
      .lean();

    const leadDocs = await SalesLead.find({})
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email")
      .populate("remarks.addedBy", "fullname")
      .sort({ assignedAt: -1, createdAt: -1 })
      .lean();

    const map = new Map();
    for (const emp of employees) {
      map.set(emp._id.toString(), {
        employeeId: emp._id,
        fullname: emp.fullname,
        email: emp.email,
        assignedTotal: 0,
        assignedToday: 0,
        contactedTotal: 0,
        contactedToday: 0,
        paidCount: 0,
        newCount: 0,
        contactedCount: 0,
        qualifiedCount: 0,
        convertedCount: 0,
        lostCount: 0,
        leads: [],
      });
    }

    for (const lead of leadDocs) {
      const assignedId = lead.assignedTo?._id?.toString();
      const createdById =
        lead.createdBy?._id?.toString() || lead.createdBy?.toString();
      const ownerId = assignedId || createdById;
      if (!ownerId || !map.has(ownerId)) continue;

      const rec = map.get(ownerId);
      if (assignedId) rec.assignedTotal += 1;

      const assignedAt = lead.assignedAt ? new Date(lead.assignedAt) : null;
      if (assignedAt && assignedAt >= start && assignedAt <= end) {
        rec.assignedToday += 1;
      }

      const remarks = lead.remarks || [];
      const hasRemarks = remarks.length > 0;
      if (hasRemarks) rec.contactedTotal += 1;

      const anyRemarkToday = remarks.some((r) => {
        const t = new Date(r.createdAt);
        return t >= start && t <= end;
      });
      if (anyRemarkToday) rec.contactedToday += 1;

      if (lead.paymentStatus === "paid") rec.paidCount += 1;

      const st = lead.status || "new";
      if (st === "new") rec.newCount += 1;
      else if (st === "contacted") rec.contactedCount += 1;
      else if (st === "qualified") rec.qualifiedCount += 1;
      else if (st === "converted") rec.convertedCount += 1;
      else if (st === "lost") rec.lostCount += 1;

      const lastR = remarks.length ? remarks[remarks.length - 1] : null;
      rec.leads.push({
        _id: lead._id,
        clientName: lead.clientName,
        companyName: lead.companyName,
        mobile: lead.mobile,
        product: lead.product,
        status: lead.status,
        paymentStatus: lead.paymentStatus || "pending",
        assignedAt: lead.assignedAt,
        remarkCount: remarks.length,
        lastRemark: lastR
          ? {
              remark: lastR.remark,
              remarkType: lastR.remarkType,
              createdAt: lastR.createdAt,
            }
          : null,
      });
    }

    const report = Array.from(map.values());

    return NextResponse.json(
      {
        success: true,
        date: date.toISOString().slice(0, 10),
        report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Daily Report Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
