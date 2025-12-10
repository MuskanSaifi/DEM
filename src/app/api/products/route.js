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


    // ✅ Fetch products including category, subcategory, and images
    const products = await Product.find({ name: { $regex: searchQuery, $options: "i" } })
      .populate("category", "name")
      .populate("subCategory", "name")
      .select("-__v");

    if (products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    // ✅ Format product images correctly
    const formattedProducts = products.map((product) => ({
      ...product.toObject(),
      images: product.images
        .filter((img) => img && (img.url || img.data)) // ✅ Remove null images
        .map((img) =>
          img.url
            ? img.url // ✅ Return URL if available
            : `data:${img.contentType};base64,${Buffer.from(img.data).toString("base64")}`
        ),
    }));

    return NextResponse.json(formattedProducts, { status: 200 });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
