"use client";
import React, { memo } from "react";
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

  return (
    <div className="bg-white py-10 px-4 sm:px-8 lg:px-12 space-y-12">
      {categories.slice(0, 5).map((category) => (
        <div
          key={category._id}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <div className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#6D4AAE] rounded-full"></span>
              {category.name}
            </div>

            <Link
              href={`/seller/${category.categoryslug}`}
              className="text-sm font-medium hover:underline text-[#6D4AAE]"
            >
              View all {category.name} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* LEFT PURPLE CARD ✅ */}
            <div className="col-span-1 rounded-2xl overflow-hidden shadow-md">
              
              <div className="bg-white flex items-center justify-center h-40">
                <div className="relative w-24 h-24">
                  <Image
                    src={category.icon || "/placeholder.jpg"}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#7E5ABD] to-[#6D4AAE] text-white p-4">
                <div className="font-bold text-lg mb-2">
                  {category.name}
                </div>

                {category.subcategories?.slice(0, 5).map((sub) => (
                  <div key={sub._id} className="text-sm opacity-90">
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE CARDS ✅ */}
            <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories?.slice(0, 6).map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center gap-4 p-4 border rounded-xl shadow-sm hover:shadow-md transition"
                >
                  {/* IMAGE */}
                  <div className="w-20 h-20 bg-gray-50 rounded flex items-center justify-center">
                    <div className="relative w-14 h-14">
                      <Image
                        src={sub.icon || "/placeholder.png"}
                        alt={sub.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col">
                    
                    {/* SUBCATEGORY LINK */}
                    <Link
                      href={`/seller/${category.categoryslug}/${sub.subcategoryslug}`}
                      className="font-semibold text-gray-800 hover:underline mb-1"
                    >
                      {sub.name}
                    </Link>

                    {/* PRODUCTS */}
                    <div className="text-sm space-y-0.5">
                      {sub.products?.slice(0, 3).map((product) => {
                        if (!product.productslug) return null;

                        return (
                          <Link
                            key={product._id}
                            href={`/manufacturers/${product.productslug}`}
                            className="block text-[#6D4AAE] hover:underline"
                          >
                            {product.name}
                          </Link>
                        );
                      })}
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(CategoryGridSection);