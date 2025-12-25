"use client"; // ✅ Forces this component to render on the client-side

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CitySearchBar from "@/components/CitySearchBar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./style.css";
import BuySellForm from "@/components/BuySellform";
import Image from "next/image";


const ProductPage = () => {
  const { name } = useParams();
  const formattedSubcategory = decodeURIComponent(name.replace(/-/g, " "));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products?subcategory=${encodeURIComponent(formattedSubcategory)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch products.");
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (formattedSubcategory) {
      fetchProducts();
    }
  }, [formattedSubcategory]);

  if (typeof window === "undefined") return null; // ✅ Prevents SSR issues

  return (
    <>
<BuySellForm productname={products.length > 0 ? products[0].name : formattedSubcategory} />
<div className="container mt-2">
        <p className="m-0 fs-esm">
          Innodem / {products.length > 0 ? products[0]?.category?.name : <Skeleton width={100} />}
          / {products.length > 0 ? products[0]?.subCategory?.name : <Skeleton width={100} />}
        </p>
        <div className="d-flex">
          <h4 className="fs-esm">{formattedSubcategory} Products</h4>
          <span className="fs-esm">({products.length || <Skeleton width={30} />})</span>
        </div>
        <CitySearchBar />

        <div className="row">
          {/* Product Listing Section */}
          <div className="col-md-2"></div>
          <div className="col-md-8 mb-4">
            {loading ? (
              <Skeleton count={3} height={100} />
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : products.length > 0 ? (
              products.map((product) => {
                // ✅ Dynamically fetch product image or provide fallback
                let productImage = "https://via.placeholder.com/100"; // Default placeholder

                if (product.images && product.images.length > 0) {
                  if (product.images[0].startsWith("http")) {
                    productImage = product.images[0]; // ✅ Use S3 URL if available
                  } else {
                    productImage = product.images[0]; // ✅ Base64 image
                  }
                }

                return (
                  <div key={product._id} className="card p-3 mb-3">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-3 text-center">
<Image
  src={productImage || "/placeholder.png"} // Fallback image
  alt={product.name || "Product Image"}
  width={100}
  height={100}
  className="rounded-md object-cover product-image"
/>

                      </div>
                      <div className="col-md-5">
                        <h5 className="text-primary bg-light p-1">{product.name}</h5>
                        <div className="table-responsive">
                        <table className="table fs-esm">
  <thead>
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Price</th>
      <td>₹{product?.price} {product?.currency || "INR"}</td>
    </tr>
    <tr>
      <th>MOQ</th>
      <td>{product?.minimumOrderQuantity || "N/A"}</td>
    </tr>
    <tr>
      <th>Colour</th>
      <td>{product?.specifications?.color || "N/A"}</td>
    </tr>
    <tr>
      <th>Category</th>
      <td>{product?.category?.name || "Not Available"}</td>
    </tr>
    <tr>
      <th>Subcategory</th>
      <td>{product?.subCategory?.name || "Not Available"}</td>
    </tr>
  </tbody>
</table>

                        </div>
                        <a href="#" className="text-info">More details...</a>
                      </div>
                      <div className="col-md-4">
                        <div className="supplier-box"></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No products found for {formattedSubcategory}.</p>
            )}
          </div>
        </div>

        
      </div>
    </>
  );
};

export default ProductPage;
