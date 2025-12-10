import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer"; // Make sure these paths are correct for your Next.js project structure
import User from "@/models/User";
import Product from "@/models/Product";
import purchaseRequestSchema from "@/models/purchaseRequestSchema";
import { NextResponse } from 'next/server'; // Import NextResponse

export async function GET(request, { params }) {
  try {
    await connectdb();

   const awaitedParams = await params;
    const { userId } = awaitedParams;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const requests = await purchaseRequestSchema
      .find({ seller: userId })
      .populate("buyer")
      .populate("product")
      .sort({ createdAt: -1 }); // Optional: sort by creation date descending

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching purchase requests:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(request, { params }) {
  try {
    await connectdb();

    // Workaround: Await params explicitly, though usually not needed for App Router
    const awaitedParams = await params;
    const { userId } = awaitedParams;

    const body = await request.json();
    const { requestId, status } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Seller User ID is required in URL" },
        { status: 400 }
      );
    }

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, message: "Request ID and status are required in body" },
        { status: 400 }
      );
    }

    const allowedStatuses = ['Pending', 'Completed', 'Cancelled', 'Responded'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status provided. Allowed: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedRequest = await purchaseRequestSchema.findOneAndUpdate(
      { _id: requestId, seller: userId },
      { status: status },
      { new: true }
    ).populate("buyer")
     .populate("product");

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, message: "Purchase request not found or not associated with this seller." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Status updated successfully", data: updatedRequest });
  } catch (error) {
    console.error("Error updating purchase request status:", error);
    return NextResponse.json(
      { success: false, message: "Server error during status update" },
      { status: 500 }
    );
  }
}