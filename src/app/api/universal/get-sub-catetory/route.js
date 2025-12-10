import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import SubCategory from "@/models/SubCategory";

export async function GET(req) {
  try {
    await connectdb();
    const subCategory = await SubCategory.find({})
    return NextResponse.json(subCategory, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}