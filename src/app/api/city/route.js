import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.toLowerCase();

    if (!city) {
      return NextResponse.json(
        { message: "City parameter is required" },
        { status: 400 }
      );
    }

    const products = await Product.find({ city })
      .select("name productslug price images")
      .limit(50)
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
