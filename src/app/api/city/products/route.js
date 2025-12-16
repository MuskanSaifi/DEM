import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const productSlug = searchParams.get("productslug");

    if (!city || !productSlug) {
      return NextResponse.json(
        { message: "city & productslug required" },
        { status: 400 }
      );
    }

    const page = Number(searchParams.get("page")) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      city: city.toLowerCase(),
      productslug: productSlug.toLowerCase(),
    })
      .select(`
        name price currency images city state
        minimumOrderQuantity specifications userId
      `)
      .populate("userId", "companyName")
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
