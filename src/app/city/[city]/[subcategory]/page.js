// app/city/[city]/[subcategory]/page.js
import mongoose from "mongoose";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import BusinessProfile from "@/models/BusinessProfile";
import Certificate from "@/models/Certificate";
import User from "@/models/User";
import Link from "next/link";
import ProductListingClient from "./ProductListingClient";

// ✅ ISR: Revalidate every 10 minutes (600 seconds) - optimized for performance
export const revalidate = 600;

// ✅ Dynamic route segment config
export const dynamic = 'force-static';
export const dynamicParams = true;

/* =========================
   Generate Metadata
========================= */
export async function generateMetadata({ params: rawParams }) {
  try {
    const params = await rawParams;
    const { city, subcategory } = params;

    const normalizedCity = city.toLowerCase();
    const normalizedSubcategory = subcategory.toLowerCase();

    await connectdb();

    const subcat = await SubCategory.findOne({
      subcategoryslug: normalizedSubcategory,
    }).lean();

    const displayCity =
      normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);
    const displaySubcategory =
      subcat?.name || subcategory.replace(/-/g, " ");

    return {
      title: `${displaySubcategory}  Manufacturers & Suppliers  in  ${displayCity}`,
description: `Find trusted ${displaySubcategory} manufacturers in ${displayCity}. Compare bulk prices, check MOQ details and connect directly with verified suppliers.`,
      alternates: {
        canonical: `https://www.dialexportmart.com/city/${normalizedCity}/${normalizedSubcategory}`,
      },
    };
  } catch (error) {
    const params = await rawParams;
    const { city, subcategory } = params;

    return {
      title: `${subcategory.replace(/-/g, " ")} in ${
        city.charAt(0).toUpperCase() + city.slice(1)
      } | Dial Export Mart`,
      description: `Find ${subcategory.replace(/-/g, " ")} products.`,
    };
  }
}

/* =========================
   Page Component
========================= */
export default async function SubcategoryPage({
  params: rawParams,
  searchParams: rawSearchParams,
}) {

  try {
    const params = await rawParams;
    const { city, subcategory } = params;

    const normalizedCity = city.toLowerCase();
    const normalizedSubcategory = subcategory.toLowerCase();

    // ✅ Pagination
    const searchParams = await rawSearchParams;
    const page = Math.max(parseInt(searchParams?.page) || 1, 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    await connectdb();

    /* ---------- Find Subcategory ---------- */
    const subcat = await SubCategory.findOne({
      $or: [
        { subcategoryslug: normalizedSubcategory },
        {
          subcategoryslug: {
            $regex: new RegExp(
              `^${normalizedSubcategory.replace(/-/g, "[-\\s]")}$`,
              "i"
            ),
          },
        },
      ],
    }).lean();

    if (!subcat) {
      return (
        <div className="container mx-auto p-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Subcategory Not Found</h1>
          <p className="text-yellow-700 bg-yellow-100 border border-yellow-400 p-4 rounded">
            The subcategory "{subcategory}" was not found.
          </p>
          <Link
            href={`/city/${normalizedCity}`}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            ← Back to City
          </Link>
        </div>
      );
    }

    const subcatObjectId =
      typeof subcat._id === "string"
        ? new mongoose.Types.ObjectId(subcat._id)
        : subcat._id;
    /* ---------- Sellers in this city (BusinessProfile.city) ---------- */
    const cityRegex = new RegExp(`^${normalizedCity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const sellersInCity = await BusinessProfile.find({
      city: cityRegex,
    })
      .select("userId")
      .lean();
    const sellerIdsInCity = (sellersInCity || [])
      .map((bp) => bp.userId?.toString())
      .filter(Boolean);

    /* ---------- Get Products: Product.city OR seller's BusinessProfile.city = city ---------- */
    const allProducts = await Product.find({
      subCategory: subcatObjectId,
      $or: [
        { city: cityRegex },
        ...(sellerIdsInCity.length ? [{ userId: { $in: sellerIdsInCity.map((id) => new mongoose.Types.ObjectId(id)) } }] : []),
      ],
    })
      .select(
        "name price currency images city state minimumOrderQuantity moqUnit specifications userId productslug description tradeShopping tradeInformation subCategory"
      )
      .populate("userId", "companyName")
      .limit(500)
      .lean();

    // ✅ Diagnostic: Log product count and verify subCategory assignment
    console.log(`🔍 [City Subcategory Page] Found ${allProducts.length} products for city: ${normalizedCity}, subcategory: ${normalizedSubcategory} (ID: ${subcatObjectId})`);
    
    // ✅ Verify all products have correct subCategory
    const productsWithWrongSubCategory = allProducts.filter(p => {
      const productSubCatId = p.subCategory?.toString() || p.subCategory;
      return productSubCatId !== subcatObjectId.toString();
    });
    
    if (productsWithWrongSubCategory.length > 0) {
      console.warn(`⚠️ [City Subcategory Page] Found ${productsWithWrongSubCategory.length} products with mismatched subCategory`);
    }

    const totalCount = allProducts.length;

    /* ---------- Fetch Business Profiles (Optimized) ---------- */
    // ✅ Extract unique user IDs efficiently
    const userIds = new Set();
    allProducts.forEach(p => {
      const userId = p.userId?._id?.toString() || p.userId?.toString();
      if (userId) userIds.add(userId);
    });

    // ✅ Fetch business profiles only if we have user IDs (batch query)
    const businessProfiles = userIds.size > 0
      ? await BusinessProfile.find({
          userId: { $in: Array.from(userIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .select("userId businessType")
          .lean()
      : [];

    // Create a map for quick lookup
    const businessProfileMap = {};
    businessProfiles.forEach(bp => {
      const userId = bp.userId?.toString();
      if (userId) {
        businessProfileMap[userId] = bp;
      }
    });

    /* ---------- Active GRC certificates for listed sellers ---------- */
    const sellerObjectIds = Array.from(userIds).filter(Boolean).map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const activeCerts =
      sellerObjectIds.length > 0
        ? await Certificate.find({
            userId: { $in: sellerObjectIds },
            status: "active",
          })
            .select("userId")
            .lean()
        : [];
    const certifiedUserIds = new Set(
      activeCerts.map((c) => String(c.userId))
    );

    /* ---------- Serialize ---------- */
    const serializedProducts = allProducts.map((product) => {
      const userId = product.userId?._id?.toString() || product.userId?.toString();
      const businessProfile = userId ? businessProfileMap[userId] : null;
      const isCertified = !!(userId && certifiedUserIds.has(userId));

      return {
        ...product,
        _id: product._id.toString(),
        isCertified,
        userId: product.userId
          ? {
              _id: product.userId._id.toString(),
              companyName: product.userId.companyName,
            }
          : null,
        businessProfile: businessProfile ? {
          businessType: businessProfile.businessType || []
        } : null,
        images:
          product.images?.map((img) => ({
            ...img,
            _id: img._id?.toString(),
          })) || [],
        specifications: product.specifications || {},
        tradeShopping: product.tradeShopping || {},
        tradeInformation: product.tradeInformation || {},
      };
    });

    /* ---------- Get Related Products (Optimized) ---------- */
    // ✅ Use case-insensitive query and limit for performance
    const relatedProducts = await Product.find({
      city: { $regex: new RegExp(`^${normalizedCity}$`, 'i') },
      subCategory: { $ne: subcatObjectId }, // Different subcategory
    })
      .select("name productslug images price city state")
      .limit(4)
      .lean();

    const serializedRelatedProducts = relatedProducts.map((product) => ({
      ...product,
      _id: product._id.toString(),
      images: product.images?.map((img) => ({
        ...img,
        _id: img._id?.toString(),
      })) || [],
    }));

    const displayCity =
      normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);
    const displaySubcategory = subcat.name;

    /* =========================
       UI - Use Client Component for Filtering
    ========================= */
    return (
      <ProductListingClient
        initialProducts={serializedProducts}
        city={normalizedCity}
        subcategory={normalizedSubcategory}
        displayCity={displayCity}
        displaySubcategory={displaySubcategory}
        totalCount={totalCount}
        relatedProducts={serializedRelatedProducts}
      />
    );
  } catch (error) {
    console.error("Subcategory page error:", error);

    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          Unable to load products. Please try again later.
        </div>
      </div>
    );
  }
}
