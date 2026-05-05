import { NextResponse } from "next/server";
import MetaLead from "@/models/MetaLead";
import connectdb from "@/lib/dbConnect";

export async function GET(request) {
  try {
    await connectdb();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc or desc

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Build sort
    const sort = { createdAt: sortOrder === "asc" ? 1 : -1 };

    const totalLeads = await MetaLead.countDocuments(query);
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
