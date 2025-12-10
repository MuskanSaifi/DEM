import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";

export async function GET() {
  try {
    await connectdb();

    // ✅ Get the total count of products
    const totalProducts = await Product.countDocuments();

    return NextResponse.json(
      {
        success: true,
        message: "Total products count retrieved successfully",
        totalProducts, // ✅ Sending the count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching product count:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product count",
        totalProducts: 0, // ✅ Return 0 in case of error
      },
      { status: 500 }
    );
  }
}
