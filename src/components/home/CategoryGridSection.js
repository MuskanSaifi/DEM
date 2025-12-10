"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const CategoryGridSection = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <p className="text-center text-gray-500 p-6 text-lg">
        No categories available.
      </p>
    );
  }

  const limitedCategories = categories.slice(0, 5); // ✅ Show only 5 categories

  return (
    <div className="bg-white py-10 px-4 sm:px-8 lg:px-12 space-y-12">
      {limitedCategories.map((category) => (
        <div
          key={category._id}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 capitalize flex items-center gap-2">
              <span
                className="inline-block w-1.5 h-6 rounded-full"
                style={{ backgroundColor: "#6D4AAE" }}
              ></span>
              {category.name}
            </h2>
            <Link
              href={`/seller/${category.categoryslug}`}
              className="text-sm font-medium hover:underline transition"
              style={{ color: "#6D4AAE" }}
            >
              View All →
            </Link>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left Card — Category Overview */}
            <div
              className="col-span-1 rounded-2xl text-white shadow-md hover:scale-105 transition-transform duration-300 overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(180deg, #7E5ABD 0%, #6D4AAE 100%)",
              }}
            >
              {/* Centered Category Image */}
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="relative w-28 h-28">
                  <Image
                    src={category.icon || "/placeholder.jpg"}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Category Info */}
              <div className="p-3">
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <div className="text-gray-200 space-y-1 text-sm">
                  {category.subcategories?.slice(0, 5).map((sub) => (
                   <Link
  key={sub._id}
  href={`/seller/${category.categoryslug}/${sub.subcategoryslug}`}
  className="block text-white relative group"
>
  {sub.name}
  <span
    className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full"
  ></span>
</Link>

                  ))}
                </div>
              </div>
            </div>

            {/* Right — Subcategory Cards */}
            <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories?.slice(0, 6).map((sub) => (
                <Link
                  key={sub._id}
                  href={`/seller/${category.categoryslug}/${sub.subcategoryslug}`}
                  className="flex bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* ✅ Centered Subcategory Image */}
                  <div className="w-28 h-28 flex items-center justify-center bg-gray-50">
                    <div className="relative w-20 h-20">
                      <Image
                        src={sub.icon || "/subcategory-placeholder.jpg"}
                        alt={sub.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Subcategory Details */}
                  <div className="p-3 flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-800 text-base capitalize mb-1">
                      {sub.name}
                    </h4>
                    <ul className="space-y-0.5 text-sm" style={{ color: "#6D4AAE" }}>
                      {sub.products?.slice(0, 3).map((product) => (
                        <li key={product._id}>
                          <Link
                            href={`/manufacturers/${product.productslug}`}
                            className="hover:underline hover:font-semibold transition"
                            style={{ color: "#6D4AAE" }}
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGridSection;
