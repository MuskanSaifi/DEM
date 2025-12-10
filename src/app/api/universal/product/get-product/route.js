import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";

export async function GET(req) {
  try {
    await connectdb();

    const products = await Product.find({ })

    return NextResponse.json(products, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
