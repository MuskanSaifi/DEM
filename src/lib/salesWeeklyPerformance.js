import SalesEmployee from "@/models/SalesEmployee";
import SalesLead from "@/models/SalesLead";
import connectdb from "@/lib/dbConnect";

export const WEEKLY_PAID_LEAD_MINIMUM = 2;
export const WEEKLY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Set SALES_AUTO_DEACTIVATION=true in env to enable automatic deactivation. */
export function isAutoDeactivationEnabled() {
  return process.env.SALES_AUTO_DEACTIVATION === "true";
}

export function getWeekStartDate() {
  return new Date(Date.now() - WEEKLY_WINDOW_MS);
}

function employeeGraceActive(employee, weekAgo) {
  const graceStart = employee.reactivatedAt || employee.createdAt;
  return graceStart && new Date(graceStart) > weekAgo;
}

/**
 * Count paid leads credited to an employee in the rolling window.
 * Includes explicit paid marks AND paid leads assigned to them (legacy data).
 */
export async function countPaidLeadsInWindow(employeeId, since = getWeekStartDate()) {
  const id = employeeId;
  return SalesLead.countDocuments({
    paymentStatus: "paid",
    $or: [
      { paidMarkedBy: id, paidMarkedAt: { $gte: since } },
      {
        assignedTo: id,
        paidMarkedAt: { $gte: since },
      },
      {
        assignedTo: id,
        paidMarkedBy: id,
        $or: [{ paidMarkedAt: null }, { paidMarkedAt: { $exists: false } }],
        updatedAt: { $gte: since },
      },
      {
        assignedTo: id,
        $and: [
          { $or: [{ paidMarkedBy: null }, { paidMarkedBy: { $exists: false } }] },
          { $or: [{ paidMarkedAt: null }, { paidMarkedAt: { $exists: false } }] },
        ],
        updatedAt: { $gte: since },
      },
    ],
  });
}

/** Backfill paidMarkedBy / paidMarkedAt for older paid leads (one-time repair). */
export async function backfillPaidLeadMarkers() {
  await connectdb();
  const leads = await SalesLead.find({
    paymentStatus: "paid",
    assignedTo: { $ne: null },
    $or: [
      { paidMarkedBy: null },
      { paidMarkedBy: { $exists: false } },
      { paidMarkedAt: null },
      { paidMarkedAt: { $exists: false } },
    ],
  }).select("_id assignedTo updatedAt createdAt");

  let updated = 0;
  for (const lead of leads) {
    await SalesLead.updateOne(
      { _id: lead._id },
      {
        $set: {
          paidMarkedBy: lead.assignedTo,
          paidMarkedAt: lead.updatedAt || lead.createdAt || new Date(),
        },
      }
    );
    updated += 1;
  }
  return updated;
}

/** Reactivate everyone auto-deactivated for low paid activity. */
export async function reactivateAllLowPerformanceEmployees() {
  await connectdb();
  const now = new Date();
  const result = await SalesEmployee.updateMany(
    { inactiveReason: "low_paid_activity" },
    {
      $set: {
        isActive: true,
        inactiveReason: null,
        inactiveAt: null,
        reactivatedAt: now,
      },
    }
  );
  return result.modifiedCount;
}

/** Deactivate active employees with fewer than 2 paid marks in the rolling 7-day window. */
export async function runWeeklyPerformanceCheck() {
  if (!isAutoDeactivationEnabled()) {
    return [];
  }

  await connectdb();
  const weekAgo = getWeekStartDate();
  const activeEmployees = await SalesEmployee.find({ isActive: true }).lean();
  const deactivated = [];

  for (const emp of activeEmployees) {
    if (employeeGraceActive(emp, weekAgo)) continue;

    const paidCount = await countPaidLeadsInWindow(emp._id, weekAgo);
    if (paidCount >= WEEKLY_PAID_LEAD_MINIMUM) continue;

    const updated = await SalesEmployee.findByIdAndUpdate(
      emp._id,
      {
        isActive: false,
        inactiveReason: "low_paid_activity",
        inactiveAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (updated) {
      deactivated.push({
        ...updated.toObject(),
        paidCountLast7Days: paidCount,
      });
    }
  }

  return deactivated;
}

export async function getLowPerformanceInactiveEmployees() {
  await connectdb();
  const weekAgo = getWeekStartDate();
  const employees = await SalesEmployee.find({
    isActive: false,
    inactiveReason: "low_paid_activity",
  })
    .select("-password")
    .sort({ inactiveAt: -1 })
    .lean();

  const withCounts = await Promise.all(
    employees.map(async (emp) => ({
      ...emp,
      paidCountLast7Days: await countPaidLeadsInWindow(emp._id, weekAgo),
    }))
  );

  return withCounts;
}
