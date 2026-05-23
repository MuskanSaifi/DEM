import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  backfillPaidLeadMarkers,
  getLowPerformanceInactiveEmployees,
  isAutoDeactivationEnabled,
  reactivateAllLowPerformanceEmployees,
  runWeeklyPerformanceCheck,
} from "@/lib/salesWeeklyPerformance";

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

    const inactiveEmployees = await getLowPerformanceInactiveEmployees();

    return NextResponse.json(
      {
        success: true,
        inactiveEmployees,
        autoDeactivationEnabled: isAutoDeactivationEnabled(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Weekly performance GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json().catch(() => ({}));
    const action = body.action || "runCheck";

    if (action === "reactivateAll") {
      const backfilled = await backfillPaidLeadMarkers();
      const reactivatedCount = await reactivateAllLowPerformanceEmployees();
      const inactiveEmployees = await getLowPerformanceInactiveEmployees();
      return NextResponse.json(
        {
          success: true,
          reactivatedCount,
          backfilledLeads: backfilled,
          inactiveEmployees,
          message: `${reactivatedCount} employee(s) reactivated. ${backfilled} paid lead record(s) repaired.`,
        },
        { status: 200 }
      );
    }

    if (action === "repair") {
      const backfilled = await backfillPaidLeadMarkers();
      return NextResponse.json(
        {
          success: true,
          backfilledLeads: backfilled,
          message: `Repaired ${backfilled} paid lead record(s).`,
        },
        { status: 200 }
      );
    }

    if (!isAutoDeactivationEnabled()) {
      const inactiveEmployees = await getLowPerformanceInactiveEmployees();
      return NextResponse.json(
        {
          success: true,
          inactiveEmployees,
          newlyDeactivated: [],
          message:
            "Auto-deactivation is OFF. Set SALES_AUTO_DEACTIVATION=true in env to enable. Use Reactivate All for wrongly deactivated accounts.",
        },
        { status: 200 }
      );
    }

    const newlyDeactivated = await runWeeklyPerformanceCheck();
    const inactiveEmployees = await getLowPerformanceInactiveEmployees();

    return NextResponse.json(
      {
        success: true,
        inactiveEmployees,
        newlyDeactivated,
        message:
          newlyDeactivated.length > 0
            ? `${newlyDeactivated.length} employee(s) auto-deactivated for low paid activity.`
            : "Weekly performance check completed.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Weekly performance POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
