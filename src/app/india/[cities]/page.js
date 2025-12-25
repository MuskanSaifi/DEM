"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const CityProductsPage = () => {
  const { cities } = useParams(); // Get city from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cities) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/universal/product/get-product`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        // Handle different API structures
        const productsList = Array.isArray(data) ? data : data.products;

        if (!productsList || !Array.isArray(productsList)) {
          throw new Error("Invalid API response structure");
        }

        // ✅ Filter products by city (ignoring those without a city field)
        const filteredProducts = productsList.filter(
          (product) => product.city && product.city.toLowerCase() === cities.toLowerCase()
        );

        setProducts(filteredProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cities]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products in {cities}</h1>

      {/* Loading & Error States */}
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="border p-4 rounded shadow hover:shadow-lg transition">
              {/* Image Handling */}
              {product.images?.length > 0 ? (
             <Image
             src={product.images[0]?.url || "/fallback.jpg"}
             alt={product.name || "Product Image"}
             width={160} // Adjust as needed
             height={160}
             className="object-cover rounded"
           />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              <p className="font-bold mt-2">₹{product.price}</p>
              <p className="text-sm">MOQ: {product.minimumOrderQuantity} {product.moqUnit || "units"}</p>
              <p className="text-sm">Stock: {product.stock !== null ? product.stock : "N/A"}</p>
              <p className="text-sm">Returnable: {product.tradeShopping?.isReturnable || "No"}</p>
              <p className="text-sm">Shipping: {product.tradeShopping?.shippingType || "N/A"}</p>
              <p className="text-sm">GST: {product.tradeShopping?.packageDimensions?.gst || 0}%</p>
            </div>
          ))
        ) : (
          <p>Please Wait...</p>
        )}
      </div>
    </div>
  );
};

export default CityProductsPage;
