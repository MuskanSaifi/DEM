"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ProductSections1 = ({ tag, Name }) => {
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

  const formatUrl = (name) =>
    encodeURIComponent(name.replace(/&/g, "and").replace(/\s+/g, "-").toLowerCase());

  return (
    <section className="mt-10 mb-16">
      <div className="max-w-8xl mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 tracking-tight">
          {Name}
        </h2>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} height={150} borderRadius={12} />
            ))}
          </div>
        )}

        {error && <p className="text-red-600 text-center">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
              1400: { slidesPerView: 6 },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <Link
                  href={`/manufacturers/${product.productslug}`}
                  className="group block text-center p-4 mb-3 rounded-2xl shadow-md hover:shadow-lg bg-white transition-all duration-300 border border-gray-100"
                >
                  <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 mx-auto rounded-full overflow-hidden border border-gray-200 shadow-inner">
                    <Image
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition">
                    {product.name.replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default ProductSections1;
