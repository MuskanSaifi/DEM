"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const IndustrySlider = () => {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/adminprofile/industryslider");
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch categories");
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  if (!isClient) return null;
  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    
<section className="py-10 mt-5">
  <div className="container-fluid mx-auto px-4">
  <h2 className="text-3xl md:text-4xl font-bold text-center  mb-8 tracking-tight">
  Explore Industries
    </h2>

    <Swiper
      modules={[Pagination, Autoplay]}
      spaceBetween={24}
      slidesPerView={1}
      loop={true}
      autoplay={{ delay: 3000 }}
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
          <div className="bg-white rounded-2xl hover:scale-[1.02] transition-all duration-300 p-4 shadow-md hover:shadow-xl transition-all mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src={category.icon || "/placeholder.png"}
                  alt={category.name}
                  width={30}
                  height={30}
                  className="rounded-lg object-cover"
                />
                <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
              </div>
              <Link
                href={`/seller/${category.categoryslug}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {category.subcategories.slice(0, 6).map((sub) => (
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
                    {sub.name.replace(/\b\w/g, (c) => c.toUpperCase())}
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
