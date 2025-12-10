// app/api/city/products/route.js (UPDATED GET function)

import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    // ✅ CHANGED: 'product' is now 'productslug'
    const productSlug = searchParams.get("productslug"); 

    if (!city || !productSlug) { // ✅ Updated check
      return NextResponse.json(
        { message: "City and productslug parameters are required" },
        { status: 400 }
      );
    }

    // ✅ CHANGED: Filtering by productslug instead of name
    const products = await Product.find({
      // City search remains exact match (case-insensitive)
      city: { $regex: `^${city}$`, $options: "i" }, 
      // Filter by the slug (case-insensitive)
      productslug: { $regex: `^${productSlug}$`, $options: "i" },
    })
      .populate("userId", "companyName mobileNumber email")
      .populate("category")
      .populate("subCategory");

    if (!products.length) {
      return NextResponse.json(
        { message: "No matching products found" },
        { status: 404 }
      );
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching product list:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}