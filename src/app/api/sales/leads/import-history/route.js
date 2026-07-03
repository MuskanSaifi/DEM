import SalesLead from "@/models/SalesLead";
import SalesEmployee from "@/models/SalesEmployee";
import { getJwtSecret } from "@/lib/env";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

function parseDayRange(date) {
  const dayStart = new Date(`${date}T00:00:00+05:30`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart, dayEnd };
}

function aggregateDatesByEmployee(employeeId) {
  return SalesLead.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(employeeId) } },
    {
      $project: {
        source: 1,
        assignedTo: 1,
        importBatchId: 1,
        activityDate: { $ifNull: ["$importedAt", "$createdAt"] },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$activityDate",
            timezone: IST_TIMEZONE,
          },
        },
        count: { $sum: 1 },
        sheetCount: {
          $sum: { $cond: [{ $eq: ["$source", "bulk_import"] }, 1, 0] },
        },
        singleCount: {
          $sum: { $cond: [{ $eq: ["$source", "manual"] }, 1, 0] },
        },
        unassigned: {
          $sum: {
            $cond: [
              { $eq: [{ $ifNull: ["$assignedTo", null] }, null] },
              1,
              0,
            ],
          },
        },
        sheetBatches: {
          $addToSet: {
            $cond: [
              { $eq: ["$source", "bulk_import"] },
              "$importBatchId",
              null,
            ],
          },
        },
      },
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        sheetCount: 1,
        singleCount: 1,
        unassigned: 1,
        batchCount: {
          $size: {
            $filter: {
              input: "$sheetBatches",
              as: "batch",
              cond: { $ne: ["$$batch", null] },
            },
          },
        },
        _id: 0,
      },
    },
    { $sort: { date: -1 } },
  ]);
}

async function getAdminEmployee(admin, employeeId) {
  if (!mongoose.Types.ObjectId.isValid(employeeId)) return null;
  return SalesEmployee.findOne({
    _id: employeeId,
    createdBy: admin.id,
  })
    .select("fullname email")
    .lean();
}

// GET - Employee lead stats, dates, or leads
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
    const employeeId = searchParams.get("employeeId");

    if (employeeId && date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }

      const employee = await getAdminEmployee(admin, employeeId);
      if (!employee) {
        return NextResponse.json(
          { success: false, message: "Employee not found" },
          { status: 404 }
        );
      }

      const { dayStart, dayEnd } = parseDayRange(date);
      const leads = await SalesLead.find({
        createdBy: employeeId,
        $or: [
          {
            source: "bulk_import",
            importedAt: { $gte: dayStart, $lt: dayEnd },
          },
          {
            source: "manual",
            createdAt: { $gte: dayStart, $lt: dayEnd },
          },
        ],
      })
        .populate("assignedTo", "fullname email")
        .populate("createdBy", "fullname email")
        .sort({ importedAt: -1, createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        date,
        employeeId,
        employee,
        leads,
        total: leads.length,
        sheetCount: leads.filter((l) => l.source === "bulk_import").length,
        singleCount: leads.filter((l) => l.source === "manual").length,
        unassigned: leads.filter((l) => !l.assignedTo).length,
      });
    }

    if (employeeId) {
      const employee = await getAdminEmployee(admin, employeeId);
      if (!employee) {
        return NextResponse.json(
          { success: false, message: "Employee not found" },
          { status: 404 }
        );
      }

      const dates = await aggregateDatesByEmployee(employeeId);
      const totalLeads = dates.reduce((sum, d) => sum + d.count, 0);
      const sheetCount = dates.reduce((sum, d) => sum + d.sheetCount, 0);
      const singleCount = dates.reduce((sum, d) => sum + d.singleCount, 0);

      return NextResponse.json({
        success: true,
        employeeId,
        employee,
        dates,
        totalLeads,
        sheetCount,
        singleCount,
      });
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }

      const { dayStart, dayEnd } = parseDayRange(date);
      const leads = await SalesLead.find({
        source: "bulk_import",
        importedAt: { $gte: dayStart, $lt: dayEnd },
      })
        .populate("assignedTo", "fullname email")
        .populate("createdBy", "fullname email")
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

    const employees = await SalesEmployee.find({ createdBy: admin.id })
      .select("fullname email isActive")
      .sort({ fullname: 1 })
      .lean();

    const employeeObjectIds = employees.map((e) => e._id);

    const leadStats =
      employeeObjectIds.length > 0
        ? await SalesLead.aggregate([
            { $match: { createdBy: { $in: employeeObjectIds } } },
            {
              $group: {
                _id: { employee: "$createdBy", source: "$source" },
                count: { $sum: 1 },
                lastAt: { $max: { $ifNull: ["$importedAt", "$createdAt"] } },
              },
            },
          ])
        : [];

    const statsMap = new Map();
    for (const stat of leadStats) {
      const empId = String(stat._id.employee);
      if (!statsMap.has(empId)) {
        statsMap.set(empId, {
          sheetCount: 0,
          singleCount: 0,
          lastActivityAt: null,
        });
      }
      const entry = statsMap.get(empId);
      if (stat._id.source === "bulk_import") {
        entry.sheetCount = stat.count;
      } else {
        entry.singleCount += stat.count;
      }
      if (
        !entry.lastActivityAt ||
        (stat.lastAt && stat.lastAt > entry.lastActivityAt)
      ) {
        entry.lastActivityAt = stat.lastAt;
      }
    }

    const employeeImports = employees.map((emp) => {
      const stats = statsMap.get(String(emp._id)) || {
        sheetCount: 0,
        singleCount: 0,
        lastActivityAt: null,
      };
      const totalLeads = stats.sheetCount + stats.singleCount;
      return {
        employeeId: emp._id,
        fullname: emp.fullname,
        email: emp.email,
        isActive: emp.isActive,
        totalLeads,
        sheetCount: stats.sheetCount,
        singleCount: stats.singleCount,
        lastActivityAt: stats.lastActivityAt,
        lastActivityDate: stats.lastActivityAt
          ? new Date(stats.lastActivityAt).toLocaleDateString("en-CA", {
              timeZone: IST_TIMEZONE,
            })
          : null,
      };
    });

    employeeImports.sort((a, b) => {
      if (b.totalLeads !== a.totalLeads) return b.totalLeads - a.totalLeads;
      return (a.fullname || "").localeCompare(b.fullname || "");
    });

    return NextResponse.json({
      success: true,
      employees: employeeImports,
      totalEmployees: employeeImports.length,
      employeesWithLeads: employeeImports.filter((e) => e.totalLeads > 0).length,
    });
  } catch (error) {
    console.error("Import History Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
