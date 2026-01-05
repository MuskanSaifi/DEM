// src/app/city/[city]/page.js
import { redirect } from "next/navigation";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category"; // ✅ Required for populate("category")
import SubCategory from "@/models/SubCategory"; // ✅ Required for populate("subCategory")
import Link from "next/link";
import Image from "next/image";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

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

    // ✅ Fetch products to get unique categories and subcategories with icons
    const products = await Product.find({ city })
      .select("category subCategory")
      .populate("category", "name icon categoryslug")
      .populate("subCategory", "name subcategoryslug icon")
      .limit(500) // Get enough to find all unique subcategories
      .lean();

    // Group by category and subcategory with icons
    const categoryMap = {};
    for (const p of products) {
      const catId = p.category?._id?.toString();
      const catName = p.category?.name || "Other Products";
      const catIcon = p.category?.icon;
      const catSlug = p.category?.categoryslug;
      const subcatId = p.subCategory?._id?.toString();
      const subcatName = p.subCategory?.name;
      const subcatSlug = p.subCategory?.subcategoryslug;
      const subcatIcon = p.subCategory?.icon;

      if (!catId || !subcatId || !subcatSlug) continue;

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          name: catName,
          icon: catIcon,
          slug: catSlug,
          subcategories: new Map(),
        };
      }

      if (!categoryMap[catId].subcategories.has(subcatId)) {
        categoryMap[catId].subcategories.set(subcatId, {
          name: subcatName,
          slug: subcatSlug,
          icon: subcatIcon,
        });
      }
    }

    const displayCity = city.charAt(0).toUpperCase() + city.slice(1);
    const categoriesList = Object.values(categoryMap);

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
