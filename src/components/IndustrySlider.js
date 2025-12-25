"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const IndustrySlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⭐ MOST IMPORTANT FIX
  const fetchedRef = useRef(false);

  useEffect(() => {
    // 🚫 prevent multiple API calls (Strict mode + re-renders)
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/adminprofile/industryslider");

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("IndustrySlider error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return null;
  if (error)
    return <p className="text-center text-red-600">{error}</p>;

  return (
    <section className="py-10 mt-5">
      <div className="container-fluid mx-auto px-4">
        <div className="text-center ">
  <span className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">
          Explore Industries
        </span>

        </div>
      
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1800: { slidesPerView: 5 },
          }}
          className="w-full"
        >
          {categories.map((category) => (
            <SwiperSlide key={category._id}>
              <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 mb-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={category.icon || "/placeholder.png"}
                      alt={category.name}
                      width={30}
                      height={30}
                      className="rounded-lg object-cover"
                    />
                    <p className="text-sm font-semibold mb-0 text-gray-800">
                      {category.name}
                    </p>
                  </div>

                  <Link
                    href={`/seller/${category.categoryslug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {/* Subcategories */}
                <div className="grid grid-cols-3 gap-3">
                  {category.subcategories
                    ?.slice(0, 6)
                    .map((sub) => (
                      <Link
                        key={sub._id}
                        href={`/seller/${category.categoryslug}/${sub.subcategoryslug}`}
                        className="group block bg-gray-100 rounded-xl p-2 hover:bg-gray-200 transition text-center"
                      >
                        <Image
                          src={sub.icon || "/placeholder.png"}
                          alt={sub.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover mx-auto h-14"
                        />
                        <p
                          className="text-xs font-medium text-gray-700 mt-2 truncate group-hover:text-gray-900"
                          title={sub.name}
                        >
                          {sub.name}
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default IndustrySlider;
