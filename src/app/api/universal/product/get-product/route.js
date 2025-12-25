import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";

export async function GET(req) {
  try {
    await connectdb();

    // ✅ CRITICAL FIX: Add pagination to prevent CPU spike
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit")) || 50, 100); // Max 100 per request
    const skip = (page - 1) * limit;

    // ✅ Only fetch required fields
    const products = await Product.find({})
      .select("name price images productslug city state category subCategory userId")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments({});

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          limit,
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // ✅ Cache for 5 minutes
        },
      }
    );

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
