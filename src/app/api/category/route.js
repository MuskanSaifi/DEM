import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

// ✅ Route segment config - API routes use cache headers for caching

export async function GET() {
  try {
    await connectDB();

    // ✅ 1) Fetch all categories + subcategories + LIMITED products (max 5 per subcategory)
    const categories = await Category.find()
      .select("name categoryslug content subcategories metatitle metadescription metakeywords")
      .populate({
        path: "subcategories",
        select: `
          name
          subcategoryslug
          metatitle
          metadescription
          metakeyword
          products
        `,
        populate: {
          path: "products",
          select: "name description price images tradeShopping tags minimumOrderQuantity currency userId",
          options: { limit: 5 }, // ✅ Limit products per subcategory
          populate: {
            path: "userId",
            select: "fullname mobileNumber",
          },
        },
      })
      .lean();


    if (!categories.length) {
      return Response.json({ message: "No categories found" }, { status: 404 });
    }

    // 2) Collect all product-user IDs
    const userIdSet = new Set();
    categories.forEach((category) => {
      category.subcategories?.forEach((sub) => {
        sub.products?.forEach((p) => {
          if (p.userId?._id) userIdSet.add(p.userId._id.toString());
          else if (typeof p.userId === "string") userIdSet.add(p.userId);
        });
      });
    });

    const userIds = [...userIdSet];

    // 3) Fetch all business profiles in one query
    const businessProfiles = await BusinessProfile.find({
      userId: { $in: userIds },
    })
      .select(
        "userId companyName address city state country gstNumber trustSealVerified yearOfEstablishment"
      )
      .lean();

    // 4) Map: userId → businessProfile
    const bpMap = {};
    businessProfiles.forEach((bp) => {
      bpMap[bp.userId.toString()] = bp;
    });

    // 5) Attach businessProfile to each product (in-memory, no DB load)
    categories.forEach((category) => {
      category.subcategories?.forEach((sub) => {
        sub.products?.forEach((product) => {
          const uid =
            product.userId?._id?.toString() ||
            product.userId?.toString() ||
            null;

          product.businessProfile = uid ? bpMap[uid] || null : null;
        });
      });
    });

    // ✅ 6) Return optimized response with caching headers
    return Response.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("❌ CATEGORY API ERROR:", error);
    return Response.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
