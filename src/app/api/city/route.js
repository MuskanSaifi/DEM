// app/api/city/route.js
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json({ message: "City parameter is required" }, { status: 400 });
    }

    console.log(`🔍 Fetching products for city: ${city}`);

    const products = await Product.find({
      city: { $regex: `^${city}$`, $options: "i" }
    });

    if (!products.length) {
      return NextResponse.json({ message: "No products found for this city" }, { status: 404 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
