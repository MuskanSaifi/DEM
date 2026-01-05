import mongoose from "mongoose";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import Link from "next/link";
import ProductCardClient from "./ProductCardClient";

// ✅ ISR: Revalidate every hour
export const revalidate = 3600;

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
      title: `${displaySubcategory} in ${displayCity} | Dial Export Mart`,
      description: `Find ${displaySubcategory} products in ${displayCity}. Browse verified suppliers and manufacturers.`,
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

    /* ---------- Products + Count ---------- */
    const [products, totalCount] = await Promise.all([
      Product.find({
        subCategory: subcatObjectId,
        city: normalizedCity,
      })
        .select(
          "name price currency images city state minimumOrderQuantity moqUnit specifications userId productslug"
        )
        .populate("userId", "companyName")
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments({
        subCategory: subcatObjectId,
        city: normalizedCity,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    /* ---------- Serialize ---------- */
    const serializedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      userId: product.userId
        ? {
            _id: product.userId._id.toString(),
            companyName: product.userId.companyName,
          }
        : null,
      images:
        product.images?.map((img) => ({
          ...img,
          _id: img._id?.toString(),
        })) || [],
    }));

    const displayCity =
      normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);
    const displaySubcategory = subcat.name;

    /* =========================
       UI
    ========================= */
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link
            href={`/city/${normalizedCity}`}
            className="text-blue-600 hover:underline"
          >
            {displayCity}
          </Link>{" "}
          / <span className="text-gray-600">{displaySubcategory}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">
          {displaySubcategory} in {displayCity}
        </h1>

        <p className="text-gray-600 mb-6">
          {totalCount} {totalCount === 1 ? "product" : "products"} found
        </p>

        {serializedProducts.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
            No products found in this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {serializedProducts.map((product) => (
                <ProductCardClient key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10 flex-wrap">
                {page > 1 && (
                  <Link
                    href={`/city/${normalizedCity}/${normalizedSubcategory}?page=${
                      page - 1
                    }`}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    ← Prev
                  </Link>
                )}

                {Array.from({ length: totalPages })
                  .slice(0, 10)
                  .map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Link
                        key={pageNum}
                        href={`/city/${normalizedCity}/${normalizedSubcategory}?page=${pageNum}`}
                        className={`px-3 py-1 border rounded ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}

                {page < totalPages && (
                  <Link
                    href={`/city/${normalizedCity}/${normalizedSubcategory}?page=${
                      page + 1
                    }`}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
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
