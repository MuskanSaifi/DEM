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

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      followupLeads,
      proposalLeads,
      notInterestedLeads,
      ringingLeads,
      hotfollowupLeads,
      paidLeads,
      totalEmployees,
      employeeStats,
    ] = await Promise.all([
      SalesLead.countDocuments(),
      SalesLead.countDocuments({ status: "new" }),
      SalesLead.countDocuments({ status: "contacted" }),
      SalesLead.countDocuments({ status: "qualified" }),
      SalesLead.countDocuments({ status: "converted" }),
      SalesLead.countDocuments({ status: "followup" }),
      SalesLead.countDocuments({ status: "proposal" }),
      SalesLead.countDocuments({ status: "not_interested" }),
      SalesLead.countDocuments({ status: "ringing" }),
      SalesLead.countDocuments({ status: "hotfollowup" }),
      SalesLead.countDocuments({ paymentStatus: "paid" }),
      SalesEmployee.countDocuments({ isActive: true }),
      SalesLead.aggregate([
        {
          $group: {
            _id: "$assignedTo",
            totalLeads: { $sum: 1 },
            converted: {
              $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "salesemployees",
            localField: "_id",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            employeeName: "$employee.fullname",
            employeeEmail: "$employee.email",
            totalLeads: 1,
            converted: 1,
          },
        },
      ]),
    ]);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          convertedLeads,
          followupLeads,
          proposalLeads,
          notInterestedLeads,
          ringingLeads,
          hotfollowupLeads,
          paidLeads,
          totalEmployees,
          employeeStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Stats Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
