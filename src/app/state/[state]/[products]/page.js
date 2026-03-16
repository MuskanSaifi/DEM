// src/app/state/[state]/[products]/page.js

import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 600;

export default async function StateSubCategoryPage({ params, searchParams }) {

  const { state, products } = await params;
  const { city } = await searchParams;


  if (!state) {
    return <div className="p-10">State not found</div>;
  }

  const stateLower = state.toLowerCase();

  await connectdb();

  // find subcategory
  const subcat = await SubCategory.findOne({
    subcategoryslug: products
  }).lean();

  if (!subcat) {
    return <div className="p-10">Subcategory not found</div>;
  }

  // query condition
let query = {
  state: stateLower,
  subCategory: subcat._id
};

if (city) {
  query.city = city.toLowerCase();
}

  // get products
  const productsData = await Product.find(
    query,
    {
      name: 1,
      price: 1,
      images: 1,
      city: 1
    }
  )
    .limit(20)
    .lean();

  // get cities of this state + subcategory
  const cities = await Product.distinct("city", {
    state: stateLower,
    subCategory: subcat._id
  });

  const displayName = subcat.name;

  return (

    <div className="container mx-auto max-w-7xl p-4">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">
        {displayName} in {state}
      </h1>

      {/* 🔹 Cities Row */}
      <div className="flex flex-wrap gap-3 mb-6">

        <Link
          href={`/state/${state}/${products}`}
          className={`px-4 py-2 border rounded ${
            !city ? "bg-blue-600 text-white" : ""
          }`}
        >
          All
        </Link>

        {cities.map((c) => (
          <Link
            key={c}
            href={`/state/${state}/${products}?city=${c}`}
            className={`px-4 py-2 border rounded capitalize ${
              city === c ? "bg-blue-600 text-white" : ""
            }`}
          >
            {c}
          </Link>
        ))}

      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT FILTER */}
        <div className="col-span-3">

          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">
              Related Category
            </h3>

            <ul className="space-y-2 text-sm">
              <li>Indian Sella Rice</li>
              <li>Pusa Rice</li>
              <li>1509 Basmati Rice</li>
              <li>Organic Basmati Rice</li>
              <li>Sharbati Rice</li>
            </ul>

          </div>

        </div>

        {/* PRODUCT LIST */}
        <div className="col-span-6 space-y-6">

          {productsData.length === 0 && (
            <div className="p-6 border rounded-lg">
              No products found
            </div>
          )}

          {productsData.map((product) => (

            <div
              key={product._id}
              className="border rounded-lg p-4 flex gap-4"
            >

              <div className="relative w-40 h-32">

                <Image
                  src={product.images?.[0]?.url || "/no-image.png"}
                  fill
                  alt={product.name}
                  className="object-cover rounded"
                />

              </div>

              <div className="flex-1">

                <h2 className="font-semibold text-lg">
                  {product.name}
                </h2>

                <p className="text-blue-600 font-bold">
                  ₹ {product.price}
                </p>

                <p className="text-sm text-gray-500">
                  Location : {product.city}, {state}
                </p>

                <div className="mt-3 flex gap-3">

                  <button className="border px-3 py-1 rounded text-blue-600">
                    View Mobile
                  </button>

                  <button className="bg-green-600 text-white px-3 py-1 rounded">
                    Send Inquiry
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-3">

          <div className="border rounded-lg p-4 bg-gray-50">

            <h3 className="font-semibold text-lg mb-3">
              Get Best Sellers for {displayName}
            </h3>

            <input
              type="text"
              placeholder="Quantity"
              className="border w-full p-2 mb-2"
            />

            <input
              type="text"
              placeholder="Mobile Number"
              className="border w-full p-2 mb-3"
            />

            <button className="bg-red-600 text-white w-full py-2 rounded">
              Submit Requirement
            </button>

          </div>

          <div className="border rounded-lg p-4 mt-4 text-center">

            <h3 className="font-semibold mb-2">
              To List your Product
            </h3>

            <p className="text-sm mb-3">
              Boost Your Business Visibility Worldwide
            </p>

            <Link
              href="/register"
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Register Now
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}