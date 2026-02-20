import { NextResponse } from "next/server";
import Contact from "@/models/Contact";
import connectdb from "@/lib/dbConnect";

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

    const contact = await Contact.findByIdAndUpdate(
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

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contact,
      message: "Remark added",
    });
  } catch (error) {
    console.error("Error adding remark:", error);
    return NextResponse.json(
      { error: "Failed to add remark" },
      { status: 500 }
    );
  }
}
