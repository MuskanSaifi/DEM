import { NextResponse } from "next/server";
import MetaLead from "@/models/MetaLead";
import connectdb from "@/lib/dbConnect";

const STATUS_REMARK_MAP = {
  contacted: "contacted",
  qualified: "qualified",
  "not interested": "lost",
};

export async function PATCH(request, { params }) {
  try {
    await connectdb();
    const { id } = await params;
    const body = await request.json();
    const { remark, addedBy } = body;

    if (!remark || typeof remark !== "string" || !remark.trim()) {
      return NextResponse.json(
        { error: "Remark text is required" },
        { status: 400 }
      );
    }

    const trimmedRemark = remark.trim();
    const update = {
      $push: {
        remarks: {
          text: trimmedRemark,
          addedBy: addedBy || "Admin",
          addedAt: new Date(),
        },
      },
    };

    const statusUpdate = STATUS_REMARK_MAP[trimmedRemark.toLowerCase()];
    if (statusUpdate) {
      update.$set = { status: statusUpdate };
    }

    const lead = await MetaLead.findByIdAndUpdate(id, update, { new: true });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      lead,
      message: "Remark added",
    });
  } catch (error) {
    console.error("Error adding remark to meta lead:", error);
    return NextResponse.json(
      { error: "Failed to add remark" },
      { status: 500 }
    );
  }
}
