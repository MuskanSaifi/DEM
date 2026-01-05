"use client";

import Link from "next/link";
import Image from "next/image";
import Buyfrom from "./Buyfrom";

export default function ProductCardClient({ product }) {
  const images = product.images?.length
    ? product.images
    : [{ url: "https://placehold.co/400x300" }];

  const displayPrice = product.price
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: product.currency || "INR",
      }).format(product.price)
    : "Price on Request";

  const sellerId = product.userId?._id || product.userId;

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <Link href={`/products/${product._id}`} className="flex-1">
        <div className="relative h-48">
          <Image
            src={images[0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 flex-1">
          <h2 className="font-semibold text-sm capitalize line-clamp-2 min-h-[2.5rem]">{product.name}</h2>
          <p className="text-lg font-bold mt-1 text-red-600">{displayPrice}</p>
          {product.minimumOrderQuantity > 0 && (
            <p className="text-xs text-gray-700 mt-1">MOQ: {product.minimumOrderQuantity}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            📍 {product.city}, {product.state}
          </p>
          <div className="mt-2 text-xs text-gray-700">
            {product.specifications?.material && (
              <p><b>Material:</b> {product.specifications.material}</p>
            )}
          </div>
          <div className="mt-2 pt-2 text-xs border-t font-medium">
            {product.userId?.companyName || "Verified Supplier"}
          </div>
        </div>
      </Link>
      {/* Send Inquiry Button */}
      <div className="p-4 pt-0 border-t">
        <Buyfrom product={product} sellerId={sellerId} />
      </div>
    </div>
  );
}

