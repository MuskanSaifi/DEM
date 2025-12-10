// app/api/seller/report/route.js

import { NextResponse } from "next/server";
import Report from "@/models/Report";
import User from "@/models/User";
import Buyer from "@/models/Buyer"; // 👈 Import Buyer model
import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/requireSignIn"; // We will assume this is updated or we handle auth manually

// 🎯 FIX 2: POST function ko update karein
export async function POST(req) {
 await connectdb();

 try {
 // Get token from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

const { sellerId, reason, customMessage, authRole } = await req.json();

    // 1. Token Decode and User/Buyer Find Logic
    let authPerson = null;
    let authModel = null;
    
    // Since we don't have verifyToken here, we will rely on client to send 'authRole'
    // For a robust solution, you should update your token verification to return ID, Role
    
    // For now, let's use the provided requireSignIn but assume it now returns the decoded payload { id, role }
    // OR, we manually check models (less secure without a robust 'requireSignIn' that decodes JWT)

    // Using a placeholder for auth logic for a single file solution:
    let authPayload;
    try {
        // Assume verifyToken is accessible or logic is here
        const { verifyToken } = await import("@/lib/jwt");
        authPayload = verifyToken(token);
    } catch(e) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
    
    if (!authPayload || !authPayload.id) {
        return NextResponse.json({ error: "Invalid Token Payload" }, { status: 401 });
    }

    if (authRole === 'buyer') {
        authPerson = await Buyer.findById(authPayload.id);
        authModel = 'Buyer';
    } else if (authRole === 'user') {
        authPerson = await User.findById(authPayload.id);
        authModel = 'User';
    } else {
        return NextResponse.json({ error: "Invalid authentication role specified" }, { status: 400 });
    }

    if (!authPerson) {
      return NextResponse.json({ error: `${authModel} not found` }, { status: 404 });
    }
    
    // 2. Check seller exists (seller will always be a User)
 const seller = await User.findById(sellerId);
 if (!seller) {
 return NextResponse.json({ error: "Seller not found" }, { status: 404 });
 }

 // 3. Create a new report
 const report = await Report.create({
 reportedBy: authPerson._id,
 reportedByModel: authModel, // 👈 New field based on role
 sellerId,
reason: customMessage && customMessage.trim() !== "" ? customMessage : reason,
 });

 return NextResponse.json({
 success: true,
 message: "Report submitted successfully. Admin will review it.",
 report,
 });
 } catch (err) {
 console.error("Report API error:", err);
 return NextResponse.json({ error: "Something went wrong", details: err.message }, { status: 500 });
 }
}

// 🎯 GET function ko update karein for dynamic population
export async function GET(req) {
 await connectdb();
 try {
 // Fetch all reports with dynamic reporter population & seller details
 const reports = await Report.find({})
 .populate("reportedBy") // Automatically uses 'reportedByModel' field to decide which model to populate from
 .populate("sellerId", "fullname email companyName")
 .sort({ createdAt: -1 });

 return NextResponse.json({
 success: true,
 count: reports.length,
 reports,
 });
 } catch (err) {
 console.error("Get Reports API error:", err);
 return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
 }
}