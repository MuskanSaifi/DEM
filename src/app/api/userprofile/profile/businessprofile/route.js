
// route.js (API Routes)
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import BusinessProfile from "@/models/BusinessProfile"; 
import { requireSignIn } from "@/middlewares/requireSignIn"; 

export async function GET(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const profile = await BusinessProfile.findOne({ userId: user.id });
    if (!profile) return NextResponse.json({ success: false, message: "Business profile not found" }, { status: 404 });
    const data = profile.toObject();
    if (!Array.isArray(data.businessType) || data.businessType.length === 0) {
      data.businessType = ["Supplier"];
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    let profile = await BusinessProfile.findOne({ userId: user.id });
    if (!profile) return NextResponse.json({ success: false, message: "Business profile not found" }, { status: 404 });
    Object.assign(profile, body);
    if (!Array.isArray(profile.businessType) || profile.businessType.length === 0) {
      profile.businessType = ["Supplier"];
    }
    await profile.save();
    return NextResponse.json({ success: true, message: "Profile updated successfully", data: profile }, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
