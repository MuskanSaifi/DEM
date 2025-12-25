import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function GET(req) {
  try {
    await connectdb();

    const category = await Category.find({})

    return NextResponse.json(category, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
