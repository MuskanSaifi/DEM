// api/manufacturers/[productslug]/route.js
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import BusinessProfile from "@/models/BusinessProfile";
import BlockedUser from "@/models/BlockedUser";
import User from "@/models/User"; // ✅ Required for populate("userId")
import Category from "@/models/Category"; // ✅ Required for populate("category")

export async function GET(request) {
  await connectdb();

  try {
    const url = new URL(request.url);
    const productslug = url.pathname.split("/").pop(); // ✅ Extract slug manually
    const userId = url.searchParams.get("userId"); // 👈 current userId frontend se bhejna hoga

    if (!productslug) {
      return NextResponse.json(
        { message: "Product slug is required", success: false },
        { status: 400 }
      );
    }

    // 👇 blocked sellers nikal lo
    let blockedSellerIds = [];
    if (userId) {
      const blockedSellers = await BlockedUser.find({ blockedBy: userId }).select("sellerId");
      blockedSellerIds = blockedSellers.map((b) => b.sellerId.toString());
    }

    const decodedProductSlug = decodeURIComponent(productslug);

    // ✅ sirf unhi products ko lao jo blocked sellers se nahi h
    const products = await Product.find({
      productslug: decodedProductSlug,
      userId: { $nin: blockedSellerIds },
    }).populate("subCategory category userId");

  if (!products || products.length === 0) {
  return NextResponse.json(
    {
      success: true,
      products: [],
      subcategories: [],
      relatedProducts: [],
      businessProfile: null,
    },
    { status: 200 }
  );
}

    const baseProduct = products[0];

    const subcategories = await SubCategory.find({ category: baseProduct.category }).populate(
      "category"
    );

    const relatedProducts = await Product.find({
      subCategory: baseProduct.subCategory,
      _id: { $nin: products.map((p) => p._id) },
      userId: { $nin: blockedSellerIds }, // 👈 filter yahan bhi
    }).limit(5);

    const businessProfile =
      !blockedSellerIds.includes(baseProduct.userId.toString()) // 👈 seller blocked h to businessProfile na do
        ? await BusinessProfile.findOne({ userId: baseProduct.userId })
        : null;

    return NextResponse.json(
      {
        success: true,
        products,
        subcategories,
        relatedProducts,
        businessProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json(
      { message: "Server error", success: false, error: error.message },
      { status: 500 }
    );
  }
}
