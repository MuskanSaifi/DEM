import { NextResponse } from "next/server";
import Subscriber from "@/models/Subscriber";
import connectdb from "@/lib/dbConnect";

export async function DELETE(req, { params }) {
  try {
    await connectdb(); // Ensure DB connection

    const { id } = params; // Get subscriber ID from URL

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Subscriber ID is required" },
        { status: 400 }
      );
    }

    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscriber deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
