
import User from "@/models/User";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    await connectdb();

    const url = new URL(req.url);
    const supportPersonId = url.searchParams.get("supportPersonId");


    const query = supportPersonId ? { supportPerson: supportPersonId } : {};

    const users = await User.find(query)
      .populate({
        path: "supportPerson",
        select: "name email number", // Include only the necessary fields
      })
      .populate({
        path: "products",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
        ],
      })
      .lean();

    for (const user of users) {
      for (const product of user.products) {
        const fullProduct = await Product.findById(product._id)
          .select("name price currency tradeInformation specifications tradeShopping")
          .lean();
        Object.assign(product, fullProduct);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      users,
      totalUsers: users.length,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({
      success: false,
      totalUsers: 0,
      message: `Internal Server Error: ${error.message}`,
    }, { status: 500 });
  }
}



