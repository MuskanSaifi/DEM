import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import BlockedUser from "@/models/BlockedUser";
import { requireBuyerAuth } from "@/middlewares/requireBuyerAuth";

export async function GET(req) {
  await connectdb();

  try {
    const authBuyer = await requireBuyerAuth(req);
    if (!authBuyer?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Use correct field for buyer
    const blockedList = await BlockedUser.find({
      blockedByBuyer: authBuyer.id,
    })
      .populate("sellerId", "fullname email mobileNumber companyName")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: blockedList.length,
      blockedList,
    });
  } catch (err) {
    console.error("Buyer blocked sellers fetch error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// 🗑️ DELETE API — Unblock seller
export async function DELETE(req) {
  await connectdb();
  try {
    const authBuyer = await requireBuyerAuth(req);
    if (!authBuyer?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const result = await BlockedUser.findOneAndDelete({
      blockedByBuyer: authBuyer.id,
      sellerId: sellerId,
    });

    if (!result) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Seller unblocked successfully" });
  } catch (error) {
    console.error("Error unblocking seller:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
