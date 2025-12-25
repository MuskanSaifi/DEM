import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import BankDetails from "@/models/BankDetails";
import { requireSignIn } from "@/middlewares/requireSignIn";

export async function GET(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const bankDetails = await BankDetails.findOne({ userId: user.id });
    if (!bankDetails) return NextResponse.json({ success: false, message: "Bank details not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: bankDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bank details:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    let bankDetailsRecord = await BankDetails.findOne({ userId: user.id });
    if (!bankDetailsRecord) return NextResponse.json({ success: false, message: "Bank details not found" }, { status: 404 });

    // Ensure IFSC code is uppercase before saving
    if (body.ifscCode) {
      body.ifscCode = body.ifscCode.toUpperCase();
    }

    // Remove country code from mobile number if present
    if (body.mobileLinked) {
      body.mobileLinked = body.mobileLinked.replace(/^\+91/, ""); // Remove +91
    }

    Object.assign(bankDetailsRecord, body);
    await bankDetailsRecord.save();

    return NextResponse.json({ success: true, message: "Bank details updated successfully", data: bankDetailsRecord }, { status: 200 });
  } catch (error) {
    console.error("Error updating bank details:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
