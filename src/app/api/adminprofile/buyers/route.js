import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const searchTerm = (searchParams.get("searchTerm") || "").trim();
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const query = {};

    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      query.$or = [
        { fullname: regex },
        { email: regex },
        { mobileNumber: regex },
        { companyName: regex },
        { productname: regex },
      ];
    }

    if (paymentStatus && ["paid", "unpaid"].includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    const buyers = await Buyer.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        message: "Buyers retrieved successfully",
        totalBuyers: buyers.length,
        buyers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching buyers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch buyers",
        totalBuyers: 0,
      },
      { status: 500 }
    );
  }
}




export async function DELETE(req) {
  try {
    await connectdb();
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("id"); // Get buyer ID from query params

    if (!buyerId) {
      return NextResponse.json({ success: false, message: "Buyer ID is required" }, { status: 400 });
    }

    const deletedBuyer = await Buyer.findByIdAndDelete(buyerId);
    if (!deletedBuyer) {
      return NextResponse.json({ success: false, message: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Buyer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting buyer:", error);
    return NextResponse.json({ success: false, message: "Failed to delete buyer" }, { status: 500 });
  }
}


export async function PATCH(req) {
  try {
    await connectdb();

    const body = await req.json();
    const { id, remark, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const update = {};
    if (typeof remark === "string") update.remark = remark;
    if (paymentStatus && ["paid", "unpaid"].includes(paymentStatus)) update.paymentStatus = paymentStatus;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: "Missing remark or paymentStatus" }, { status: 400 });
    }

    const updated = await Buyer.findByIdAndUpdate(id, update, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Updated successfully", updated }, { status: 200 });
  } catch (error) {
    console.error("❌ PATCH error:", error); // This is already good
    return NextResponse.json({ success: false, message: "Failed to update remark" }, { status: 500 });
  }
}