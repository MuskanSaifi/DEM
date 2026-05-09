// app/city/[city]/[subcategory]/ProductCardClient.js
"use client";
import Link from "next/link";
import Image from "next/image";
import Buyfrom from "./Buyfrom";
import { MapPin, CheckCircle2 } from "lucide-react";
import { memo } from "react";
import GrcVerifiedBadge from "@/components/GrcVerifiedBadge";

function ProductCardClient({ product }) {
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

  // Get certification info
  const hasGST = product.tradeShopping?.gst !== null && product.tradeShopping?.gst !== undefined;
  const hasCertification = hasGST || product.tradeInformation?.certifications;

  // Get packaging info - Check multiple sources
  const packagingType = product.tradeInformation?.packagingDetails 
    ? product.tradeInformation.packagingDetails.split(',')[0].trim() // Get first packaging type
    : product.tradeShopping?.unit 
    ? product.tradeShopping.unit 
    : null;

  // Get usage/type info
  const usage = product.specifications?.usage || 
               product.specifications?.application || 
               product.specifications?.productType || 
               product.specifications?.type || 
               "";

  return (
    <div className="group bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* IMAGE */}
      <Link href={`/products/${product._id}`} className="relative h-48 overflow-hidden bg-gray-50">
        <Image
          src={images[0]?.url || images[0] || "https://placehold.co/400x300"}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110 p-2"
          unoptimized
        />
        {product.isCertified && (
          <span className="absolute top-3 left-3">
            <GrcVerifiedBadge size="sm" />
          </span>
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product._id}`}>
          <div className="font-semibold text-base capitalize line-clamp-2 hover:text-red-600 mb-2">
            {product.name}
          </div>
        </Link>

     {/* PRICE */}
<p className="text-2xl font-bold text-red-600 mb-2 flex items-end gap-2">
  <span>{displayPrice}</span>
</p>

   {/* MOQ */}
   {product.minimumOrderQuantity > 0 && (
          <p className="text-xs text-gray-600 mb-2">
            <span className="font-medium">MOQ:</span> <b>{product.minimumOrderQuantity} {product.moqUnit || ""}</b>
          </p>
        )}

        {/* CERTIFICATION */}
        {hasCertification && (
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            {hasGST && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle2 size={12} />
                GST Certified
              </span>
            )}
            {product.tradeInformation?.certifications && (
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle2 size={12} />
                {product.tradeInformation.certifications}
              </span>
            )}
          </div>
        )}

        {/* USAGE/TYPE */}
        {usage && (
          <p className="text-xs text-gray-600 mb-1">
            <span className="font-medium">Usage:</span> {usage}
          </p>
        )}
        

        {/* MATERIAL TAG */}
        {product.specifications?.material && (
          <div className="my-2">
            <span className="inline-block text-xs bg-gray-100 px-3 py-1 rounded-full border">
              Material: {product.specifications.material}
            </span>
          </div>
        )}

{product.description && (
  <p className="text-xs text-gray-600 mb-3 flex-1">
    {product.description.split(" ").slice(0, 15).join(" ")}...
  </p>
)}


        {/* SELLER INFO */}
        <div className="mt-auto pt-3 border-t">
          {/* <div className="text-xs font-medium text-gray-800 mb-1">
            Seller: {product.userId?.fullname || "Verified Supplier"}
          </div> */}

          

              {/* LOCATION */}
    <div className="flex items-center px-2 text-xs text-gray-600">
          <MapPin size={14} />
          <span className="capitalize">{product.city}, {product.state}</span>
        </div>
          
          {/* BUSINESS TYPE / SUPPLIER TYPE */}
          {product.businessProfile?.businessType && 
           Array.isArray(product.businessProfile.businessType) && 
           product.businessProfile.businessType.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.businessProfile.businessType.map((type, index) => (
                <span
                  key={index}
                  className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200 font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* CTA */}
      <div className="p-4 pt-0 border-t">
        <Buyfrom product={product} sellerId={sellerId} />
      </div>
    </div>
  );
}

// ✅ Optimize with React.memo to prevent unnecessary re-renders
export default memo(ProductCardClient);
