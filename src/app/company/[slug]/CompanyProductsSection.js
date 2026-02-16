"use client";

import React from "react";
import Buyfrom from "@/app/products/[id]/Buyfrom";

export default function CompanyProductsSection({ user }) {
  const products = user?.products ?? [];
  const sellerId = user?._id;

  if (!products.length) {
    return <p className="text-center text-gray-500 text-lg">No products available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-2 text-center border border-gray-200"
        >
          {product.images?.[0]?.url && (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-52 object-cover rounded-lg mb-4"
            />
          )}
          <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
          <p className="text-gray-500 line-clamp-2 mb-0 text-sm">{product.description}</p>
          <div>
            <p className="text-indigo-600 font-bold m-1">₹{product.price}</p>
            <p className="text-sm text-gray-400 mb-1">
              MOQ: {product.minimumOrderQuantity} {product.moqUnit}
            </p>
            <Buyfrom
              product={product}
              sellerId={sellerId}
              buttonLabel="Enquiry Now"
              buttonClassName="inline-flex items-center gap-1 m-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
