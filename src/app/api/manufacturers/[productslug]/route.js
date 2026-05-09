// api/manufacturers/[productslug]/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import BusinessProfile from "@/models/BusinessProfile";
import BlockedUser from "@/models/BlockedUser";
import User from "@/models/User"; // ✅ Required for populate("userId")
import Category from "@/models/Category"; // ✅ Required for populate("category")
import Certificate from "@/models/Certificate";

async function attachGrcCertified(docs) {
  if (!docs?.length) return [];
  const uidStrs = [
    ...new Set(
      docs
        .map((p) => {
          const u = p.userId;
          return u?._id?.toString() || u?.toString();
        })
        .filter(Boolean)
    ),
  ];
  if (!uidStrs.length) {
    return docs.map((p) => ({ ...(p.toObject ? p.toObject() : p), isCertified: false }));
  }
  const oids = uidStrs.map((id) => new mongoose.Types.ObjectId(id));
  const active = await Certificate.find({
    userId: { $in: oids },
    status: "active",
  })
    .select("userId")
    .lean();
  const certified = new Set(active.map((c) => String(c.userId)));

  return docs.map((p) => {
    const o = p.toObject ? p.toObject() : { ...p };
    const uid =
      o.userId?._id?.toString() || o.userId?.toString?.() || String(o.userId || "");
    return { ...o, isCertified: !!(uid && certified.has(uid)) };
  });
}

// ✅ Route segment config - API routes use cache headers for caching

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
    { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // Cache for 1 hour
      },
    }
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
    })
      .populate("userId")
      .limit(5);

    const [productsPayload, relatedPayload] = await Promise.all([
      attachGrcCertified(products),
      attachGrcCertified(relatedProducts),
    ]);

    const businessProfile =
      !blockedSellerIds.includes(baseProduct.userId.toString()) // 👈 seller blocked h to businessProfile na do
        ? await BusinessProfile.findOne({ userId: baseProduct.userId })
        : null;

    return NextResponse.json(
      {
        success: true,
        products: productsPayload,
        subcategories,
        relatedProducts: relatedPayload,
        businessProfile,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // ✅ Cache for 1 hour to reduce CPU spikes
        },
      }
    );
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json(
      { message: "Server error", success: false, error: error.message },
      { status: 500 }
    );
  }
}
