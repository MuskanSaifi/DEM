// src/app/city/[city]/page.js
import { redirect } from "next/navigation";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
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

    // ✅ FIXED: Add error handling and ensure efficient query
    // ✅ CRITICAL: Reduced limit from 500 to 200 to prevent CPU spike
    const products = await Product.find({ city })
      .select("name price images productslug category subCategory moqUnit")
      .populate("category", "name")
      .populate("subCategory", "name")
      .limit(200) // ✅ CRITICAL: Reduced from 500 to 200
      .lean();

    // Group by category (JS-side, cheap)
    const categories = {};
    for (const p of products) {
      const cat = p.category?.name || "Other Products";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(p);
    }

    const displayCity =
      city.charAt(0).toUpperCase() + city.slice(1);

    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">
          Business Directory of{" "}
          <span className="text-blue-600">{displayCity}</span>
        </h1>

        {Object.entries(categories).map(([catName, catProducts]) => (
          <div key={catName} className="mb-12 border-b pb-6">
            <h2 className="text-2xl font-bold mb-4 border-l-4 pl-3 border-blue-600">
              {catName}
              <span className="text-sm text-gray-500 ml-3">
                ({catProducts.length} unique products)
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {catProducts.slice(0, 6).map((product) => (
                <Link
                  key={product._id}
                  href={`/city/${city}/${product.productslug}`}
                >
                  <div className="bg-white border rounded-lg shadow hover:shadow-lg transition">
                    <div className="relative h-32">
                      <Image
                        src={product.images?.[0]?.url || "https://placehold.co/400x300"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-xs text-red-600 font-bold mt-1">
                        ₹{product.price?.toLocaleString("en-IN") || "Price on Request"}
                        <span className="text-gray-500 ml-1">
                          /{product.moqUnit || "Unit"}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
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
