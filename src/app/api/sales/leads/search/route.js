import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SalesLead from "@/models/SalesLead";
import SalesEmployee from "@/models/SalesEmployee";
import connectdb from "@/lib/dbConnect";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: false, message: "Search query required" });
    }

    const searchRegex = new RegExp(query, "i");
const leads = await SalesLead.find({
  $or: [
    { gst: searchRegex },
    { mobile: searchRegex },
    { companyName: searchRegex },
    { email: searchRegex },
  ],
})
.limit(8) // 👈 ADD THIS
.populate("assignedTo", "fullname email")
.populate("createdBy", "fullname email")
.select("clientName companyName mobile email gst status paymentStatus assignedTo");

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}