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

    const employees = await SalesEmployee.find({ isActive: true })
      .select("_id fullname email")
      .lean();

    const leadDocs = await SalesLead.find({
      assignedTo: { $exists: true, $ne: null },
    })
      .select("assignedTo status paymentStatus remarks")
      .lean();

    const map = new Map();
    for (const emp of employees) {
      map.set(emp._id.toString(), {
        employeeId: emp._id,
        fullname: emp.fullname,
        email: emp.email,
        assignedTotal: 0,
        contactedTotal: 0,
        paidCount: 0,
        convertedCount: 0,
        qualifiedCount: 0,
        lostCount: 0,
      });
    }

    for (const lead of leadDocs) {
      const empId = lead.assignedTo?.toString();
      if (!empId || !map.has(empId)) continue;

      const rec = map.get(empId);
      rec.assignedTotal += 1;

      const remarks = lead.remarks || [];
      if (remarks.length > 0) rec.contactedTotal += 1;

      if (lead.paymentStatus === "paid") rec.paidCount += 1;

      const st = lead.status || "new";
      if (st === "converted") rec.convertedCount += 1;
      else if (st === "qualified") rec.qualifiedCount += 1;
      else if (st === "lost") rec.lostCount += 1;
    }

    const list = Array.from(map.values()).sort((a, b) => {
      if (b.convertedCount !== a.convertedCount)
        return b.convertedCount - a.convertedCount;
      if (b.paidCount !== a.paidCount) return b.paidCount - a.paidCount;
      return b.contactedTotal - a.contactedTotal;
    });

    const leaderboard = list.map((r, i) => ({ ...r, rank: i + 1 }));

    return NextResponse.json(
      { success: true, leaderboard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
