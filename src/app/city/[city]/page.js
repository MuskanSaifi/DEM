// app/[city]/page.js
import { redirect } from "next/navigation";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import Link from "next/link";
import Image from "next/image";

// ⭐ Add Dynamic Meta Tags
export async function generateMetadata({ params }) {
  const cityRaw = await params;
  const city = cityRaw.city.toLowerCase();
  const displayCity = city.charAt(0).toUpperCase() + city.slice(1);

  return {
    title: `Top Business Directory in ${displayCity} | Verified local Suppliers & Manufacturers`,
    description: `Explore top verified suppliers and manufacturers in  ${displayCity}. Find trusted local businesses, products, and complete contact details.
    `,
    keywords: [
      `${displayCity} business directory`,
      `${displayCity} suppliers`,
      `${displayCity} manufacturers`,
      `local businesses in ${displayCity}`,
      `Dial Export Mart`,
    ],
  };
}

export default async function CityPage({ params }) {
  const raw = await params;
  const cityParam = raw.city;

  // 🔥 Force lowercase slug
  const city = cityParam.toLowerCase();

  // 🔥 Auto redirect if uppercase or mixed case found
  if (cityParam !== city) {
    redirect(`/${city}`);
  }

  await connectdb();

  let products;
  try {
    products = await Product.aggregate([
      {
        $match: {
          city: { $regex: `^${city}$`, $options: "i" },
        },
      },
      {
        $group: {
          _id: "$name",
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" },
      },
    ]);

    await Product.populate(products, [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
    ]);
  } catch (error) {
    console.error("Database error:", error);
    return (
      <div className="container mx-auto p-4 text-red-600">
        Error loading product data.
      </div>
    );
  }

  // Group products by category
  const categories = {};
  products.forEach((p) => {
    const cat = p.category?.name || "Other Products";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  const displayCity =
    city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Business Directory of <span className="text-blue-600">{displayCity}</span>
      </h1>

      {products.length === 0 && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p className="font-bold">No Products Found</p>
          <p>No listed products for {displayCity} yet.</p>
        </div>
      )}

      {Object.entries(categories).map(([catName, catProducts], idx) => (
        <div key={idx} className="mb-12 border-b pb-6">
          <h2 className="text-2xl font-extrabold mb-5 border-l-4 pl-3 border-blue-600 text-gray-700">
            {catName}
            <span className="text-sm font-medium text-gray-500 ml-3">
              ({catProducts.length} unique products)
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {catProducts.slice(0, 6).map((product) => (
              <Link
                key={product._id}
                href={`/city/${city}/${encodeURIComponent(product.productslug)}`}
                className="block"
              >
                <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 overflow-hidden h-full">
                  <div className="relative w-full h-32">
                    <Image
                      src={
                        product.images?.[0]?.url ||
                        "https://placehold.co/400x300/e0e0e0/555?text=No+Image"
                      }
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <p className="font-semibold text-sm leading-tight text-gray-800 capitalize line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-red-600 mt-1 font-bold">
                      ₹
                      {product.price
                        ? product.price.toLocaleString("en-IN")
                        : "Price on Request"}
                      <span className="text-gray-500 font-normal ml-1">
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
}
