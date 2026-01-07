"use client";

import Link from "next/link";
import Image from "next/image";
import Buyfrom from "./Buyfrom";
import { MapPin } from "lucide-react";
import { useState } from "react";


export default function ProductCardClient({ product }) {
    const [expanded, setExpanded] = useState(false);
  const images = product.images?.length
    ? product.images
    : [{ url: "https://placehold.co/400x300" }];

  const displayPrice = product.price
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: product.currency || "INR",
        maximumFractionDigits: 0,
      }).format(product.price)
    : "Price on Request";

  const sellerId = product.userId?._id || product.userId;

  return (
    <div className="group bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* IMAGE */}
      <Link href={`/products/${product._id}`} className="relative h-52 overflow-hidden">
        <Image
          src={images[0].url}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 bg-white/90 text-xs px-2 py-1 rounded-full font-medium shadow">
          Verified
        </span>
      </Link>

      {/* CONTENT */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product._id}`}>
          <h2 className="font-semibold text-sm capitalize line-clamp-2  hover:text-red-600">
            {product.name}
          </h2>
        </Link>

        {/* PRICE */}
        <p className="text-xl font-bold text-red-600 mb-1">
          {displayPrice}
        </p>

<div className="text-xs text-gray-600 mb-0">
  <p className={`${expanded ? "" : "line-clamp-3"}`}>
    {product.description}
  </p>

  {product.description?.length > 120 && (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-red-600 font-medium hover:underline"
    >
      {expanded ? "read less" : "read more..."}
    </button>
  )}
</div>


        {/* MOQ */}
        {product.minimumOrderQuantity > 0 && (
          <p className="text-xs text-gray-600 mb-1">
            MOQ: <b>{product.minimumOrderQuantity} {product.moqUnit}</b>
          </p>
        )}

        {/* LOCATION */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin size={14} />
          <span>{product.city}, {product.state}</span>
        </div>

        {/* SPEC TAG */}
        {product.specifications?.material && (
          <div className="my-2">
            <span className="inline-block text-xs bg-gray-100 px-3 py-1 rounded-full">
              {product.specifications.material}
            </span>
          </div>
        )}

        {/* SELLER */}
        <div className="mt-auto pt-3 border-t text-xs font-medium text-gray-800">
          {product.userId?.companyName || "Verified Supplier"}
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 pt-0">
        <Buyfrom product={product} sellerId={sellerId} />
      </div>
    </div>
  );
}
