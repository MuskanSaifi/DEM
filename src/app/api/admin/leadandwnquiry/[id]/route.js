import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import purchaseRequestSchema from "@/models/purchaseRequestSchema";

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

    const lead = await purchaseRequestSchema.findByIdAndUpdate(
      id,
      {
        $push: {
          remarks: {
            text: remark.trim(),
            addedBy: addedBy || "Admin",
            addedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      lead,
      message: "Remark added",
    });
  } catch (error) {
    console.error("Error adding remark to lead:", error);
    return NextResponse.json(
      { error: "Failed to add remark" },
      { status: 500 }
    );
  }
}
