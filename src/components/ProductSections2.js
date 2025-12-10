"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider = dynamic(() => import("react-slick").then((mod) => mod.default), { ssr: false });

const ProductSections2 = ({ tag, Name }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/adminprofile/seller");
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch products");
        const filteredProducts = data.filter((product) => product.tags?.[tag] === true);
        setProducts(filteredProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [tag]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="mt-5 px-4">
      <div className="container-fluid bg-white p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 tracking-tight">
        {Name} Products</h2>
        </div>
        {loading && <Skeleton count={5} height={180} />}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500">No products found.</p>
        )}

        {!loading && !error && (
          <Slider {...settings}>
            {products.map((product) => {
              return (
                <div key={product._id} className="p-2">
                  <div className="bg-white border rounded-xl shadow-md hover:shadow-xl transition p-4 h-full flex flex-col justify-between">
                    <div className="relative w-full h-40 mb-3 rounded overflow-hidden">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 transform hover:scale-105"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{product.seller || "Unknown Seller"}</p>
                      <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                        {product.name.replace(/\b\w/g, (c) => c.toUpperCase())}
                      </h3>
                      <p className="text-blue-600 font-bold text-md mb-2">₹{product.price}/Pieces</p>
                      <Link
                        href={`/manufacturers/${product.productslug}`}
                        className="inline-block w-full py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        )}
      </div>
    </section>
  );
};
export default ProductSections2;
