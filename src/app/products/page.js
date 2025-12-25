"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CitySearchBar from "@/components/CitySearchBar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./style.css";
import Image from "next/image";
import ProductFilter from "./Filter";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const queryString = searchParams.toString();
        const response = await fetch(`/api/universal/product/get-product?${queryString}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch products.");
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  return (
 <>
 <section className="mt-5 mb-5">
 <div className="container">
      {/* Breadcrumbs */}
      <p className="m-0 fs-esm">
        Innodem /
        {products.length > 0 ? (
          <>
            {products[0]?.category?.name} / {products[0]?.subCategory?.name}
          </>
        ) : (
          <>
            <Skeleton width={100} /> / <Skeleton width={100} />
          </>
        )}
      </p>

      {/* Page Header */}
      <div className="d-flex align-items-center">
        <h4 className="fs-esm">Products</h4>
        <span className="fs-esm ms-2">({products.length || <Skeleton width={30} />})</span>
      </div>

      {/* City Search Bar */}
      <CitySearchBar />

      {/* Grid Layout for Filter & Products */}
      <div className="row mt-3">
        {/* Sidebar Filter Section */}
        <div className="col-md-3">
          <ProductFilter />
        </div>

        {/* Product Listing */}
        <div className="col-md-9">
          {loading ? (
            <Skeleton count={3} height={100} />
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="card p-3 mb-3">
                <div className="row g-3 align-items-center">
                  {/* Product Image */}
                  <div className="col-md-3 text-center">
                  <Image
  src={product.images?.[0]?.url || "/placeholder.png"}
  alt={product.name || "Product Image"}
  width={200}
  height={200}
  className="img-fluid rounded product-image"
/>
                  </div>

                  {/* Product Details */}
                  <div className="col-md-5">
                    <h5 className="text-primary bg-light p-1">{product.name}</h5>
                    <table className="table fs-esm">
                      <tbody>
                        <tr>
                          <th>Price</th>
                          <td>₹{product.price} {product.currency}</td>
                        </tr>
                        <tr>
                          <th>MOQ</th>
                          <td>{product.minimumOrderQuantity || "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Colour</th>
                          <td>{product.specifications?.color || "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Category</th>
                          <td>{product.category?.name || "Not Available"}</td>
                        </tr>
                        <tr>
                          <th>Subcategory</th>
                          <td>{product.subCategory?.name || "Not Available"}</td>
                        </tr>
                      </tbody>
                    </table>
                    <a href={`/products/${encodeURIComponent(product.name.replace(/\s+/g, "-").toLowerCase())}/${product._id}`} className="text-info">More details...</a>
                  </div>

                  {/* Placeholder for Supplier Box */}
                  <div className="col-md-4">
                    <div className="supplier-box"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>
    </div>
 </section>
 </>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading products...</div>}>
    <ProductList />
  </Suspense>
);

export default Page;
