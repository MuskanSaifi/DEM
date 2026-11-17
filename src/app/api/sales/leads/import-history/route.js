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
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  return { dayStart, dayEnd };
}

function getIstYmd(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
}

function istDayStart(ymd) {
  return new Date(`${ymd}T00:00:00+05:30`);
}

function shiftIstYmd(ymd, days) {
  const shifted = new Date(istDayStart(ymd).getTime() + days * 24 * 60 * 60 * 1000);
  return shifted.toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
}

function resolveUnassignedRange(range, from, to) {
  const today = getIstYmd();
  if (range === "today") return { from: today, to: today };
  if (range === "3days") return { from: shiftIstYmd(today, -2), to: today };
  if (range === "week") return { from: shiftIstYmd(today, -6), to: today };
  if (range === "custom" && from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    const toDate = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : today;
    return { from, to: toDate < from ? from : toDate };
  }
  return { from: null, to: null };
}

function unassignedQuery({ from, to, source } = {}) {
  const clauses = [
    { $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }] },
  ];

  if (from && to) {
    const { dayStart } = parseDayRange(from);
    const { dayEnd } = parseDayRange(to);
    const range = { $gte: dayStart, $lt: dayEnd };
    clauses.push({
      $or: [{ createdAt: range }, { importedAt: range }],
    });
  }

  if (source === "bulk_import" || source === "manual") {
    clauses.push({ source });
  }

  return clauses.length === 1 ? clauses[0] : { $and: clauses };
}

async function getUnassignedNewLeads({ range, from, to, source }) {
  const today = getIstYmd();
  const resolved = resolveUnassignedRange(range, from, to);
  const last3 = { from: shiftIstYmd(today, -2), to: today };
  const lastWeek = { from: shiftIstYmd(today, -6), to: today };
  const date = { from: resolved.from, to: resolved.to };

  const [all, todayCount, last3Count, lastWeekCount, sheetAll, sheetInRange, singleInRange, leads] =
    await Promise.all([
      SalesLead.countDocuments(unassignedQuery()),
      SalesLead.countDocuments(unassignedQuery({ from: today, to: today })),
      SalesLead.countDocuments(unassignedQuery({ from: last3.from, to: last3.to })),
      SalesLead.countDocuments(unassignedQuery({ from: lastWeek.from, to: lastWeek.to })),
      SalesLead.countDocuments(unassignedQuery({ source: "bulk_import" })),
      SalesLead.countDocuments(unassignedQuery({ ...date, source: "bulk_import" })),
      SalesLead.countDocuments(unassignedQuery({ ...date, source: "manual" })),
      SalesLead.find(unassignedQuery({ ...date, source }))
        .populate("createdBy", "fullname email")
        .sort({ importedAt: -1, createdAt: -1 })
        .limit(2000)
        .lean(),
    ]);

  return {
    range: range || "all",
    source: source || "",
    from: resolved.from,
    to: resolved.to,
    leads,
    total: leads.length,
    counts: {
      all,
      today: todayCount,
      last3days: last3Count,
      lastWeek: lastWeekCount,
      sheetAll,
      sheet: sheetInRange,
      single: singleInRange,
      filtered: leads.length,
    },
  };
}

function getActivityDateString(activityDate) {
  if (!activityDate) return null;
  return new Date(activityDate).toLocaleDateString("en-CA", {
    timeZone: IST_TIMEZONE,
  });
}

function isSheetImportLead(lead) {
  return lead?.source === "bulk_import";
}

/** Prefer assignment time, then import time, then create time. */
function getLeadActivityDate(lead) {
  return lead?.assignedAt || lead?.importedAt || lead?.createdAt || null;
}

function employeeLeadMatch(employeeId) {
  const oid = new mongoose.Types.ObjectId(employeeId);
  return {
    $or: [{ assignedTo: oid }, { createdBy: oid }],
  };
}

async function findLeadsForEmployeeOnDate(employeeId, date) {
  const leads = await SalesLead.find(employeeLeadMatch(employeeId))
    .populate("assignedTo", "fullname email")
    .populate("createdBy", "fullname email")
    .populate("assignedBy", "fullname email")
    .sort({ assignedAt: -1, importedAt: -1, createdAt: -1 })
    .lean();

  return leads.filter(
    (lead) => getActivityDateString(getLeadActivityDate(lead)) === date
  );
}

function aggregateDatesByEmployee(employeeId) {
  const oid = new mongoose.Types.ObjectId(employeeId);
  return SalesLead.aggregate([
    {
      $match: {
        $or: [{ assignedTo: oid }, { createdBy: oid }],
      },
    },
    {
      $project: {
        source: 1,
        assignedTo: 1,
        assignedBy: 1,
        importBatchId: 1,
        activityDate: {
          $ifNull: ["$assignedAt", { $ifNull: ["$importedAt", "$createdAt"] }],
        },
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
          $sum: { $cond: [{ $ne: ["$source", "bulk_import"] }, 1, 0] },
        },
        adminAssignedCount: {
          $sum: {
            $cond: [
              { $ne: [{ $ifNull: ["$assignedBy", null] }, null] },
              1,
              0,
            ],
          },
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
        adminAssignedCount: 1,
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
    const view = searchParams.get("view");

    if (view === "unassigned") {
      const sourceParam = searchParams.get("source");
      const payload = await getUnassignedNewLeads({
        range: searchParams.get("range") || "today",
        from: searchParams.get("from"),
        to: searchParams.get("to"),
        source:
          sourceParam === "bulk_import" || sourceParam === "manual"
            ? sourceParam
            : "",
      });
      return NextResponse.json({ success: true, ...payload });
    }

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

      const leads = await findLeadsForEmployeeOnDate(employeeId, date);
      const adminAssignedCount = leads.filter((l) => l.assignedBy).length;

      return NextResponse.json({
        success: true,
        date,
        employeeId,
        employee,
        leads,
        total: leads.length,
        sheetCount: leads.filter((l) => isSheetImportLead(l)).length,
        singleCount: leads.filter((l) => !isSheetImportLead(l)).length,
        adminAssignedCount,
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
      const adminAssignedCount = dates.reduce(
        (sum, d) => sum + (d.adminAssignedCount || 0),
        0
      );

      return NextResponse.json({
        success: true,
        employeeId,
        employee,
        dates,
        totalLeads,
        sheetCount,
        singleCount,
        adminAssignedCount,
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
        $or: [
          { importedAt: { $gte: dayStart, $lt: dayEnd } },
          { assignedAt: { $gte: dayStart, $lt: dayEnd } },
        ],
      })
        .populate("assignedTo", "fullname email")
        .populate("createdBy", "fullname email")
        .populate("assignedBy", "fullname email")
        .sort({ assignedAt: -1, importedAt: -1 })
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
            {
              $match: {
                $or: [
                  { assignedTo: { $in: employeeObjectIds } },
                  { createdBy: { $in: employeeObjectIds } },
                ],
              },
            },
            {
              $addFields: {
                // Attribute lead to assignee when present, else creator (self add/import)
                employeeKey: { $ifNull: ["$assignedTo", "$createdBy"] },
                activityAt: {
                  $ifNull: [
                    "$assignedAt",
                    { $ifNull: ["$importedAt", "$createdAt"] },
                  ],
                },
              },
            },
            {
              $match: {
                employeeKey: { $in: employeeObjectIds },
              },
            },
            {
              $group: {
                _id: { employee: "$employeeKey", source: "$source" },
                count: { $sum: 1 },
                adminAssignedCount: {
                  $sum: {
                    $cond: [
                      { $ne: [{ $ifNull: ["$assignedBy", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                lastAt: { $max: "$activityAt" },
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
          adminAssignedCount: 0,
          lastActivityAt: null,
        });
      }
      const entry = statsMap.get(empId);
      if (stat._id.source === "bulk_import") {
        entry.sheetCount = stat.count;
      } else {
        entry.singleCount += stat.count;
      }
      entry.adminAssignedCount += stat.adminAssignedCount || 0;
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
        adminAssignedCount: 0,
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
        adminAssignedCount: stats.adminAssignedCount,
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
