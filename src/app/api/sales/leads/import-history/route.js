import SalesLead from "@/models/SalesLead";
import { getJwtSecret } from "@/lib/env";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const IST_TIMEZONE = "Asia/Kolkata";

async function verifyAdmin(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.role !== "sales-admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET - List import dates or leads for a specific date
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
    const date = searchParams.get("date");

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }

      const dayStart = new Date(`${date}T00:00:00+05:30`);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const leads = await SalesLead.find({
        source: "bulk_import",
        importedAt: { $gte: dayStart, $lt: dayEnd },
      })
        .populate("assignedTo", "fullname email")
        .sort({ importedAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        date,
        leads,
        total: leads.length,
        unassigned: leads.filter((l) => !l.assignedTo).length,
      });
    }

    const dates = await SalesLead.aggregate([
      { $match: { source: "bulk_import", importedAt: { $ne: null } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$importedAt",
              timezone: IST_TIMEZONE,
            },
          },
          count: { $sum: 1 },
          unassigned: {
            $sum: {
              $cond: [
                { $eq: [{ $ifNull: ["$assignedTo", null] }, null] },
                1,
                0,
              ],
            },
          },
          batches: { $addToSet: "$importBatchId" },
        },
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          unassigned: 1,
          batchCount: { $size: "$batches" },
          _id: 0,
        },
      },
      { $sort: { date: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      dates,
      totalDates: dates.length,
    });
  } catch (error) {
    console.error("Import History Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
