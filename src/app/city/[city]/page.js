// src/app/city/[city]/page.js
import { redirect } from "next/navigation";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import BusinessProfile from "@/models/BusinessProfile";
import Link from "next/link";
import Image from "next/image";
import mongoose from "mongoose";

// ✅ ISR: Revalidate every 10 minutes (600 seconds) - optimized for performance
export const revalidate = 600;

// ✅ Dynamic route segment config
export const dynamic = 'force-static';
export const dynamicParams = true;

/* ⭐ SEO METADATA (FIXED) */
export async function generateMetadata({ params }) {
  const { city } = await params; // ✅ MUST await
  const cityLower = city.toLowerCase();
  const displayCity =
    cityLower.charAt(0).toUpperCase() + cityLower.slice(1);

  return {
    title: `Top Business Directory in ${displayCity} | Verified local Suppliers & Manufacturers`,
    description: `Explore top verified suppliers and manufacturers in ${displayCity}. Find trusted local businesses, products, and complete contact details.`,
    keywords: [
      `${displayCity} business directory`,
      `${displayCity} suppliers`,
      `${displayCity} manufacturers`,
      `local businesses in ${displayCity}`,
      `Dial Export Mart`,
    ],
    alternates: {
      canonical: `https://www.dialexportmart.com/city/${cityLower}`,
    },
  };
}

export default async function CityPage({ params }) {
  try {
    const { city: cityParam } = await params; // ✅ MUST await
    const city = cityParam.toLowerCase();

    // 🔁 canonical redirect
    if (cityParam !== city) {
      redirect(`/city/${city}`);
    }

    await connectdb();

    const cityRegex = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

    // ✅ Sellers in this city (BusinessProfile.city) — so subcategories like Furniture show when seller is in city
    const sellersInCity = await BusinessProfile.find({ city: cityRegex })
      .select("userId")
      .lean();
    const sellerIdsInCity = (sellersInCity || [])
      .map((bp) => bp.userId)
      .filter(Boolean);

    const cityMatch = { $regex: cityRegex };
    const matchStage = {
      subCategory: { $ne: null },
      category: { $ne: null },
      $or: [
        { city: cityMatch },
        ...(sellerIdsInCity.length ? [{ userId: { $in: sellerIdsInCity.map((id) => new mongoose.Types.ObjectId(id.toString())) } }] : []),
      ],
    };

    // ✅ OPTIMIZED: Use aggregation pipeline (Product.city OR seller's BusinessProfile.city)
    const categorySubcategoryData = await Product.aggregate([
      { $match: matchStage },
      // ✅ Limit to prevent CPU spike (1000 products max per city)
      { $limit: 1000 },
      // ✅ Lookup category
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData',
          pipeline: [
            { $project: { name: 1, icon: 1, categoryslug: 1 } }
          ]
        }
      },
      // ✅ Lookup subcategory
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategoryData',
          pipeline: [
            { $project: { name: 1, subcategoryslug: 1, icon: 1 } }
          ]
        }
      },
      // ✅ Unwind arrays
      { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: false } },
      { $unwind: { path: '$subCategoryData', preserveNullAndEmptyArrays: false } },
      // ✅ Group by category and subcategory to get unique pairs
      {
        $group: {
          _id: {
            categoryId: '$category',
            subCategoryId: '$subCategory'
          },
          categoryName: { $first: '$categoryData.name' },
          categoryIcon: { $first: '$categoryData.icon' },
          categorySlug: { $first: '$categoryData.categoryslug' },
          subCategoryName: { $first: '$subCategoryData.name' },
          subCategorySlug: { $first: '$subCategoryData.subcategoryslug' },
          subCategoryIcon: { $first: '$subCategoryData.icon' }
        }
      },
      // ✅ Sort for consistent output
      { $sort: { categoryName: 1, subCategoryName: 1 } }
    ]).allowDiskUse(true); // ✅ Allow disk use for large datasets

    // ✅ Group by category (optimized Map structure)
    const categoryMap = new Map();
    
    for (const item of categorySubcategoryData) {
      const catId = item._id.categoryId.toString();
      const subcatId = item._id.subCategoryId.toString();
      
      // Skip if essential data is missing
      if (!item.categoryName || !item.subCategoryName) continue;
      
      // Get or create category
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          name: item.categoryName,
          icon: item.categoryIcon,
          slug: item.categorySlug,
          subcategories: new Map(),
        });
      }
      
      // Add subcategory if not already present
      const category = categoryMap.get(catId);
      if (!category.subcategories.has(subcatId)) {
        category.subcategories.set(subcatId, {
          name: item.subCategoryName,
          slug: item.subCategorySlug || subcatId,
          icon: item.subCategoryIcon,
        });
      }
    }
    
    // Convert Map to array for rendering
    const categoriesList = Array.from(categoryMap.values());
    const displayCity = city.charAt(0).toUpperCase() + city.slice(1);

    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">
          Business Directory of{" "}
          <span className="text-blue-600">{displayCity}</span>
        </h1>

        {categoriesList.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>No Categories Found!</strong>
            <span className="ml-2">No products found in {displayCity}.</span>
          </div>
        ) : (
          categoriesList.map((category, idx) => (
          <div key={idx} className="mb-12 border-b pb-6">
            {/* Category Header with Icon */}
            <div className="flex items-center gap-3 mb-4 border-l-4 pl-3 border-blue-600">
              {category.icon && (
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={category.icon}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {category.name}
                  <span className="text-sm text-gray-500 ml-3 font-normal">
                    ({category.subcategories.size} {category.subcategories.size === 1 ? "item" : "items"})
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from(category.subcategories.values()).map((subcat) => (
                <Link
                  key={subcat.slug}
                  href={`/city/${city}/${subcat.slug}`}
                  className="bg-white border rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 text-center flex flex-col items-center"
                >
                  {/* Subcategory Image */}
                  {subcat.icon ? (
                    <div className="relative w-16 h-16 mb-3">
                      <Image
                        src={subcat.icon || "/placeholder.png"}
                        alt={subcat.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  <p className="font-semibold text-sm capitalize">
                    {subcat.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">View Products →</p>
                </Link>
              ))}
            </div>
          </div>
          ))
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading city page:", error);
    // Return error state instead of crashing
    const { city: cityParam } = await params;
    const displayCity = cityParam.charAt(0).toUpperCase() + cityParam.slice(1).toLowerCase();
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">
          Business Directory of{" "}
          <span className="text-blue-600">{displayCity}</span>
        </h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> Unable to load products. Please try again later.
        </div>
      </div>
    );
  }
}
