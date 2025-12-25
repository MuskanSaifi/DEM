// api/products/route.js
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("subcategory");

    if (!searchQuery) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }


    // ✅ CRITICAL FIX: Add limit to prevent CPU spike
    // ✅ Fetch products including category, subcategory, and images
    const products = await Product.find({ name: { $regex: searchQuery, $options: "i" } })
      .populate("category", "name")
      .populate("subCategory", "name")
      .select("-__v")
      .limit(100) // ✅ CRITICAL: Limit to prevent fetching all products
      .lean(); // ✅ Use lean() for better performance

    if (products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    // ✅ Format product images correctly (lean() already returns plain objects)
    const formattedProducts = products.map((product) => ({
      ...product,
      images: product.images
        .filter((img) => img && (img.url || img.data)) // ✅ Remove null images
        .map((img) =>
          img.url
            ? img.url // ✅ Return URL if available
            : `data:${img.contentType};base64,${Buffer.from(img.data).toString("base64")}`
        ),
    }));

    return NextResponse.json(formattedProducts, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // ✅ Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
