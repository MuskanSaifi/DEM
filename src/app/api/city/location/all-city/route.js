// src/app/api/city/location/all-city/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    const data = await Product.aggregate([
      {
        $match: {
          city: { $ne: null },
          state: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            state: "$state",
            city: "$city",
          },
          totalProducts: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.state",
          cities: {
            $push: {
              city: "$_id.city",
              totalProducts: "$totalProducts",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}