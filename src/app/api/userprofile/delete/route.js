import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product";
import BankDetails from "@/models/BankDetails";
import BusinessProfile from "@/models/BusinessProfile";

export async function DELETE(req) {
  try {
    await dbConnect();

    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // ✅ User exist check
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
  
    // ✅ Delete all related data
    await Product.deleteMany({ userId });
    await BankDetails.deleteMany({ userId });
    await BusinessProfile.deleteMany({ userId });

    // ✅ Finally delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: "Account and all related data deleted successfully" });
  } catch (err) {
    console.error("Error in DELETE handler:", err);
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Internal Server Error", error: err.message }, { status: 500 });
  }
}
