import { NextResponse } from "next/server";
import BlockedUser from "@/models/BlockedUser";
import User from "@/models/User";
import Buyer from "@/models/Buyer";
import { requireSignIn } from "@/middlewares/requireSignIn";
import { requireBuyerAuth } from "@/middlewares/requireBuyerAuth"; // 👈 new
import connectdb from "@/lib/dbConnect";

export async function POST(req) {
  await connectdb();
  try {
    const body = await req.json();
    const { sellerId, role } = body; // 👈 role = "user" or "buyer"

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    // validate seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    let authUser = null;
    if (role === "user") {
      authUser = await requireSignIn(req);
      if (!authUser?.id)
        return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    } else if (role === "buyer") {
      authUser = await requireBuyerAuth(req);
      if (!authUser?.id)
        return NextResponse.json({ error: "Unauthorized buyer" }, { status: 401 });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if already blocked
    const alreadyBlocked = await BlockedUser.findOne({
      sellerId,
      ...(role === "user"
        ? { blockedByUser: authUser.id }
        : { blockedByBuyer: authUser.id }),
    });

    if (alreadyBlocked) {
      return NextResponse.json({ message: "Already blocked" }, { status: 200 });
    }

    // Create new block entry
    const block = await BlockedUser.create({
      sellerId,
      ...(role === "user"
        ? { blockedByUser: authUser.id }
        : { blockedByBuyer: authUser.id }),
    });

    return NextResponse.json({
      success: true,
      message: "Blocked successfully",
      block,
    });
  } catch (err) {
    console.error("Block API error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}


export async function GET(req) {
  await connectdb();

  try {
    // Fetch all blocked sellers
const blockedSellers = await BlockedUser.find({})
  .populate("blockedByUser", "fullname email mobileNumber companyName") // Correctly populates User details
  .populate("blockedByBuyer", "fullname email mobileNumber") // Correctly populates Buyer details
  .populate("sellerId", "fullname email mobileNumber companyName")
  .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: blockedSellers.length,
      blockedSellers,
    });
  } catch (err) {
    console.error("Get Blocked Users API error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
