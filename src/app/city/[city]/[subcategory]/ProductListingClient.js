"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterSidebar from "./FilterSidebar";
import MobileFilterModal from "./MobileFilterModal";
import ProductCardClient from "./ProductCardClient";
import Link from "next/link";
import Image from "next/image";

export default function ProductListingClient({ 
  initialProducts = [], 
  city, 
  subcategory, 
  displayCity, 
  displaySubcategory,
  totalCount,
  relatedProducts = []
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get filter values from URL
  const minPrice = parseInt(searchParams.get("minPrice")) || 0;
  const maxPrice = parseInt(searchParams.get("maxPrice")) || 100000;
  const minMOQ = searchParams.get("minMOQ");
  const maxMOQ = searchParams.get("maxMOQ");
  const businessType = searchParams.get("businessType");
  const material = searchParams.get("material");

  // Pagination
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 12; // 2 columns × 6 rows = 12 products
  const skip = (page - 1) * limit;

  // Apply filters - optimized with early returns and efficient filtering
  const filteredProducts = useMemo(() => {
    // Early return if no filters applied
    const hasPriceFilter = minPrice > 0 || maxPrice < 100000;
    const hasMOQFilter = minMOQ || maxMOQ;
    const hasBusinessTypeFilter = !!businessType;
    const hasMaterialFilter = !!material;

    if (!hasPriceFilter && !hasMOQFilter && !hasBusinessTypeFilter && !hasMaterialFilter) {
      return initialProducts;
    }

    // Use for loop instead of filter chain for better performance
    const filtered = [];
    const minPriceNum = minPrice || 0;
    const maxPriceNum = maxPrice || 100000;
    const minMOQNum = minMOQ ? parseFloat(minMOQ) : null;
    const maxMOQNum = maxMOQ ? parseFloat(maxMOQ) : null;

    for (let i = 0; i < initialProducts.length; i++) {
      const product = initialProducts[i];
      let shouldInclude = true;

      // Price filter - early exit if fails
      if (hasPriceFilter) {
        const price = product.price || 0;
        if (price < minPriceNum || price > maxPriceNum) {
          shouldInclude = false;
          continue;
        }
      }

      // MOQ filter - early exit if fails
      if (hasMOQFilter && shouldInclude) {
        const moq = product.minimumOrderQuantity || 0;
        if (minMOQNum !== null && moq < minMOQNum) {
          shouldInclude = false;
          continue;
        }
        if (maxMOQNum !== null && moq > maxMOQNum) {
          shouldInclude = false;
          continue;
        }
      }

      // Business Type filter - early exit if fails
      if (hasBusinessTypeFilter && shouldInclude) {
        const productBusinessTypes = product.businessProfile?.businessType || [];
        if (!Array.isArray(productBusinessTypes) || !productBusinessTypes.includes(businessType)) {
          shouldInclude = false;
          continue;
        }
      }

      // Material filter - early exit if fails
      if (hasMaterialFilter && shouldInclude) {
        if (product.specifications?.material !== material) {
          shouldInclude = false;
          continue;
        }
      }

      if (shouldInclude) {
        filtered.push(product);
      }
    }

    return filtered;
  }, [initialProducts, minPrice, maxPrice, minMOQ, maxMOQ, businessType, material]);

  // Paginate filtered products
  const paginatedProducts = filteredProducts.slice(skip, skip + limit);
  const totalPages = Math.ceil(filteredProducts.length / limit);

  // FAQs data
  const faqs = [
    {
      question: `What is the minimum order quantity for ${displaySubcategory} in ${displayCity}?`,
      answer: `The minimum order quantity (MOQ) varies by supplier. Most suppliers in ${displayCity} offer flexible MOQ starting from 30-50 units. Check individual product listings for specific MOQ requirements.`
    },
    {
      question: `Are the suppliers verified and certified?`,
      answer: `Yes, suppliers listed on this page are verified. Many manufacturers and wholesalers are GST registered and provide valid business documentation.Certification details, where applicable, are displayed on individual product or supplier listings.`
    },
    {
      question: `Can I get samples before placing a bulk order?`,
      answer: `Most suppliers offer sample policies. You can contact suppliers directly through the "Send Enquiry" button to request samples. Sample policies vary - some offer free samples while others charge for samples.`
    },
    {
      question: `What payment terms are available?`,
      answer: `Payment terms vary by supplier. Common options include T/T (Telegraphic Transfer), L/C (Letter of Credit), and D/P (Documents against Payment). Contact suppliers directly to negotiate payment terms.`
    },
    {
      question: `Do manufacturers provide GST invoices?`,
      answer: `Yes, many manufacturers and suppliers provide GST invoices for applicable orders. Availability of GST invoices may vary depending on the supplier and order value. Buyers are advised to confirm GST invoicing details directly with suppliers before placing bulk orders.`
    },
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href={`/city/${city}`}
          className="text-blue-600 hover:underline"
        >
          {displayCity}
        </Link>{" "}
        / <span className="text-gray-600">{displaySubcategory}</span>
      </nav>

      {/* Page Title & Description */}
      <h1 className="text-2xl font-bold mb-2">
      {displaySubcategory
  .toLowerCase()
  .replace(/\b\w/g, (char) => char.toUpperCase())
} Manufacturers, Suppliers & Wholesalers in {displayCity}
      </h1>

      <p className="text-gray-600 max-w-6xl  text-sm mb-3">
  Find verified {displaySubcategory} manufacturers and suppliers in {displayCity} for your
  bulk and wholesale sourcing needs. This page allows buyers to explore multiple
  supplier options, review key details such as MOQ, pricing and product
  specifications, and compare businesses in one place. Designed for resellers,
  exporters and B2B buyers, the listings help simplify supplier selection and
  enable direct communication with trusted manufacturers and suppliers.
</p>


      {/* Trust Badges */}
      <div className="flex flex-wrap gap-3 text-sm mb-6">
        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
          ✓ Verified Suppliers
        </span>
        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          ✓ Bulk & Export Supply
        </span>
        <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
          ✓ GST / FSSAI Certified
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
          {filteredProducts.length !== initialProducts.length && (
            <span className="text-gray-400 ml-2">
              (from {initialProducts.length} total)
            </span>
          )}
        </p>
        
        {/* Mobile Filter Button - Only on mobile */}
        <MobileFilterModal 
          products={initialProducts}
          city={city}
          subcategory={subcategory}
        />
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <FilterSidebar products={initialProducts} />
        </aside>

        {/* Right Content - Products Grid */}
        <div className="flex-1">
          {paginatedProducts.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
              No products found matching your filters.
            </div>
          ) : (
            <>
              {/* Products Grid - 2 columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCardClient key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10 flex-wrap">
                  {page > 1 && (
                    <Link
                      href={`/city/${city}/${subcategory}?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: String(page - 1)
                      }).toString()}`}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      ← Prev
                    </Link>
                  )}

                  {Array.from({ length: totalPages })
                    .slice(0, 10)
                    .map((_, i) => {
                      const pageNum = i + 1;
                      const params = new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: String(pageNum)
                      });
                      return (
                        <Link
                          key={pageNum}
                          href={`/city/${city}/${subcategory}?${params.toString()}`}
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
                      href={`/city/${city}/${subcategory}?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: String(page + 1)
                      }).toString()}`}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}

           
              {/* About Section */}
              <div className="mt-12 mb-8 ">
                <h2 className="text-2xl font-bold mb-4">About {displaySubcategory} Manufacturers & Suppliers in {displayCity}</h2>
                <p className="text-gray-700 mb-4">
                  {displayCity} is a major hub for {displaySubcategory.toLowerCase()} manufacturing and trading. 
                  The city offers a wide range of quality products from verified manufacturers, wholesalers, and exporters 
                  at competitive prices. Suppliers in {displayCity} are known for their reliable service, quality products, 
                  and flexible order terms.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">Wide range of verified suppliers and manufacturers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">Competitive pricing with flexible MOQ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">GST and FSSAI certified suppliers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">Export quality products available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">Direct contact with suppliers for better deals</span>
                  </li>
                </ul>
              </div>

              {/* Types Section */}
              <div className="mt-12 mb-8 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Types of {displaySubcategory} Available in {displayCity}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.slice(0, 9).map((product, idx) => (
                    <div key={product._id || idx} className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700 capitalize text-sm">{product.name || `${displaySubcategory} - Type ${idx + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Section */}
              <div className="mt-12 mb-8">
                            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                              {faqs.map((faq, idx) => (
                                <div key={idx} className="border-b pb-4">
                                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>


              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div className="mt-12 mb-8">
                  <h2 className="text-2xl font-bold mb-4">Related Products in {displayCity}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedProducts.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        {product.images?.[0]?.url && (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="w-full h-24 object-contain mb-2"
                          />
                        )}
                        <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {product.city}, {product.state}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

