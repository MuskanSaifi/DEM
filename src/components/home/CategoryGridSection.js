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
    <div className="bg-white py-6 px-3 sm:px-6 lg:px-10 space-y-10">
      {categories.slice(0, 5).map((category) => (
        <div key={category._id} className="bg-white rounded-2xl p-2 sm:p-5">

          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#6D4AAE] rounded-full"></span>
              {category.name}
            </div>

            <Link
              href={`/seller/${category.categoryslug}`}
              className="text-xs sm:text-sm font-medium text-[#6D4AAE] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            {/* LEFT PURPLE CARD */}
            <div className="hidden md:block col-span-1 rounded-xl overflow-hidden shadow-sm">
              
              <div className="bg-white flex items-center justify-center h-32">
                <div className="relative w-20 h-20">
                  <Image
                    src={category.icon || "/placeholder.jpg"}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#7E5ABD] to-[#6D4AAE] text-white p-3">
                <div className="font-semibold text-sm mb-2">
                  {category.name}
                </div>

                {category.subcategories?.slice(0, 5).map((sub) => (
                  <div key={sub._id} className="text-xs opacity-90">
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {category.subcategories?.slice(0, 6).map((sub) => (
                <div
                  key={sub._id}
                  className="
                  flex flex-col md:flex-row 
                  items-center md:items-start 
                 gap-1 md:gap-3 p-2 md:p-3
                  border border-gray-200 
                  rounded-xl 
                  bg-white
                  shadow-sm
                  hover:shadow-xl 
                  hover:border-[#6D4AAE]
                  transition duration-200"
                >

                  {/* IMAGE (LEFT FIXED) */}
                  <div className="
                    w-16 h-16 
                    flex-shrink-0 
                    bg-gray-50 
                    rounded-md 
                    flex items-center justify-center">
                    
                    <div className="relative w-12 h-12 md:w-10 md:h-10">
                      <Image
                        src={sub.icon || "/placeholder.png"}
                        alt={sub.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1 text-left ">

                    {/* SUBCATEGORY */}
                    <Link
                      href={`/seller/${category.categoryslug}/${sub.subcategoryslug}`}
                      className="font-medium text-gray-800 hover:underline text-xs md:text-sm"
                    >
                      {sub.name}
                    </Link>

                    {/* PRODUCTS (only desktop) */}
                    <div className="hidden md:block text-xs mt-1 space-y-0.5">
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