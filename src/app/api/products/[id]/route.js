import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import BlockedUser from "@/models/BlockedUser";

export async function GET(req, context) {
  try {
    await connectdb();

    const params = await context.params; // await params

 const id = params.id;

if (!id) {
  return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
}

if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
}

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const buyerId = searchParams.get("buyerId");

    const loggedInId = userId || buyerId;

    // 🔹 Fetch blocked sellers based on role
    let blockedSellerObjectIds = [];
    if (userId) {
      const blockedSellers = await BlockedUser.find({
        blockedByUser: new mongoose.Types.ObjectId(userId),
      }).select("sellerId");

      blockedSellerObjectIds = blockedSellers.map(b => b.sellerId.toString());
    } else if (buyerId) {
      const blockedSellers = await BlockedUser.find({
        blockedByBuyer: new mongoose.Types.ObjectId(buyerId),
      }).select("sellerId");

      blockedSellerObjectIds = blockedSellers.map(b => b.sellerId.toString());
    }

    console.log("🔹 LoggedIn ID:", loggedInId);
    console.log("🚫 Blocked Seller ObjectIds:", blockedSellerObjectIds);

    // Convert to ObjectIds for Mongo queries
    blockedSellerObjectIds = blockedSellerObjectIds.map(id =>
      id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
    );

    // --- Fetch Product ---
    const product = await Product.findOne({
      _id: id,
      userId: { $nin: blockedSellerObjectIds },
    })
      .populate("category", "name categoryslug icon")
      .populate("subCategory", "name subcategoryslug icon")
      .populate("userId", "fullname companyName _id userProfileSlug")
      .select("-__v");

    if (!product) {
      return NextResponse.json({ error: "Product not found or blocked seller" }, { status: 404 });
    }

    const businessProfile = await BusinessProfile.findOne({
      userId: product.userId._id,
    }).select("-__v");

    const formattedProduct = {
      ...product.toObject(),
      businessProfile: businessProfile ? businessProfile.toObject() : null,
      images: product.images?.filter(img => img?.url).map(img => img.url),
    };  

    // --- Related Products ---
    let relatedProducts = [];
    const maxRelatedProducts = 12;
    const relatedProductSelectFields =
      "name images tradeShopping minimumOrderQuantity specifications description userId";
    const relatedProductPopulate = [
      { path: "category", select: "name" },
      { path: "userId", select: "fullname companyName _id" },
    ];

    // 1️⃣ Same SubCategory
    if (product.subCategory) {
      relatedProducts = await Product.find({
        subCategory: product.subCategory._id,
        _id: { $ne: product._id },
        userId: { $nin: blockedSellerObjectIds },
      })
        .populate(relatedProductPopulate)
        .select(relatedProductSelectFields)
        .limit(maxRelatedProducts);
    }

    // 2️⃣ Same Category
    if (relatedProducts.length < maxRelatedProducts && product.category) {
      const moreRelated = await Product.find({
        category: product.category._id,
        _id: { $nin: relatedProducts.map(p => p._id) },
        userId: { $nin: blockedSellerObjectIds },
      })
        .populate(relatedProductPopulate)
        .select(relatedProductSelectFields)
        .limit(maxRelatedProducts - relatedProducts.length);

      relatedProducts = [...relatedProducts, ...moreRelated];
    }

    // 3️⃣ General Products
    if (relatedProducts.length < maxRelatedProducts) {
      const remainingSlots = maxRelatedProducts - relatedProducts.length;
      const excludedProductIds = new Set([
        ...relatedProducts.map(p => p._id.toString()),
        product._id.toString(),
      ]);

      const generalRelated = await Product.find({
        _id: { $nin: Array.from(excludedProductIds) },
        userId: { $nin: blockedSellerObjectIds },
      })
        .populate(relatedProductPopulate)
        .select(relatedProductSelectFields)
        .limit(remainingSlots);

      relatedProducts = [...relatedProducts, ...generalRelated];
    }

    // Add business profiles to related products
    const relatedProductsWithBusinessProfiles = await Promise.all(
      relatedProducts.map(async rp => {
        const rpBusinessProfile = rp.userId
          ? await BusinessProfile.findOne({ userId: rp.userId._id })
              .select("gstNumber yearOfEstablishment")
              .lean()
          : null;

        return {
          ...rp.toObject(),
          businessProfile: rpBusinessProfile,
          images: rp.images?.filter(img => img?.url).map(img => img.url),
        };
      })
    );

    // --- Related Categories ---
    let relatedCategories = [];
    const maxCategoriesToShow = 18;

    const currentCategoryId = product.category?._id;
    const currentSubCategoryId = product.subCategory?._id;

    if (currentCategoryId) {
      const subCategories = await SubCategory.find({
        category: currentCategoryId,
        _id: { $ne: currentSubCategoryId },
      })
        .populate("category", "categoryslug")
        .select("name subcategoryslug icon")
        .limit(maxCategoriesToShow);

      relatedCategories = subCategories.map(sub => ({
        _id: sub._id,
        name: sub.name,
        slug: `${sub.category.categoryslug}/${sub.subcategoryslug}`,
        image: sub.icon || "/placeholder-category.png",
        type: "subcategory",
      }));
    }

    if (relatedCategories.length < maxCategoriesToShow) {
      const remainingSlots = maxCategoriesToShow - relatedCategories.length;
      const alreadyIncludedSlugs = new Set(relatedCategories.map(item => item.slug));

      const productsForCategoriesDisplay = await Product.find({
        _id: { $ne: product._id },
        "images.0": { $exists: true },
        productslug: { $nin: Array.from(alreadyIncludedSlugs) },
        userId: { $nin: blockedSellerObjectIds },
      })
        .select("name images productslug")
        .limit(remainingSlots);

      productsForCategoriesDisplay.forEach(p => {
        relatedCategories.push({
          _id: p._id,
          name: p.name,
          slug: p.productslug || p._id.toString(),
          image: p.images?.[0]?.url || "/placeholder-product.png",
          type: "product_as_category_display",
        });
      });
    }

    // --- Return product with related data and blocked sellers ---
    return NextResponse.json(
      {
        ...formattedProduct,
        relatedProducts: relatedProductsWithBusinessProfiles,
        relatedCategories,
        blockedSellerObjectIds, // 🔹 send blocked sellers for Redux update
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
