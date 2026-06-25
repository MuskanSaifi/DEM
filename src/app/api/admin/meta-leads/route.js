import { NextResponse } from "next/server";
import MetaLead from "@/models/MetaLead";
import connectdb from "@/lib/dbConnect";

function buildDateQuery(startDate, endDate) {
  if (!startDate && !endDate) return {};

  const query = {};
  if (startDate) {
    query.$gte = new Date(startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query.$lte = end;
  }
  return { createdAt: query };
}

export async function GET(request) {
  try {
    await connectdb();

    const { searchParams } = new URL(request.url);
    const exportAll = searchParams.get("exportAll") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query = buildDateQuery(startDate, endDate);
    const sort = { createdAt: sortOrder === "asc" ? 1 : -1 };

    const totalLeads = await MetaLead.countDocuments(query);

    if (exportAll) {
      const leads = await MetaLead.find(query).sort(sort);
      return NextResponse.json({
        success: true,
        data: leads,
        totalLeads,
      });
    }

    const skip = (page - 1) * limit;
    const leads = await MetaLead.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalLeads / limit);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        currentPage: page,
        totalPages,
        totalLeads,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching meta leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch meta leads" },
      { status: 500 }
    );
  }
}
