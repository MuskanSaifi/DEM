"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CACHE_KEY = "sidebarData";
const CACHE_TIME = 1000 * 60 * 60 * 24 * 5; // ✅ 5 days

const SidebarMenu = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuRef = useRef(null);
  const router = useRouter();

  // 🔥 OPTIMIZED FETCH (SAME UI)
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      const { data, time } = JSON.parse(cached);

      if (Date.now() - time < CACHE_TIME) {
        setCategories(data);
        setLoading(false);
        return;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    const fetchSidebar = async () => {
      try {
        const res = await fetch("/api/adminprofile/sidebarmenu");
        const data = await res.json();

        setCategories(data);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, time: Date.now() })
        );
      } catch (err) {
        console.error("Sidebar API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebar();
  }, []);

  // Hide active menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ----------- LOADING SKELETON (SAME) -------------
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f2f2f2" highlightColor="#e0e0e0">
        <div className="menu bg-white rounded-md w-64 d-none-mob p-4">
          <Skeleton height={30} width="60%" className="mb-4" />
          <ul className="space-y-2">
            {Array(8)
              .fill()
              .map((_, i) => (
                <li key={i} className="flex items-center space-x-2 py-1">
                  <Skeleton circle height={24} width={24} />
                  <Skeleton height={20} width="80%" />
                </li>
              ))}
          </ul>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="menu bg-white rounded-md w-64 d-none-mob" ref={menuRef}>
      {/* Top Categories */}
      <Link href="/industry">
        <h2 className="category font-semibold text-lg text-web mb-2">
          Top Categories
        </h2>
      </Link>

      {/* ----------- CATEGORY LIST (SAME UI) ------------- */}
      <ul className="border top-cat-list border-b border-gray-300 p-2">
        {categories.slice(0, 11).map((category) => (
          <li
            key={category._id}
            className={`cursor-pointer hover:bg-gray-100 py-2 rounded-md ${
              activeCategory === category._id ? "bg-gray-200" : ""
            }`}
            onClick={() =>
              router.push(`/seller/${category.categoryslug}`)
            }
            onMouseEnter={() => setActiveCategory(category._id)}
          >
            <div className="flex items-center">
              <Image
                src={category.icon || "/default-category.png"}
                alt={category.name}
                width={24}
                height={24}
                loading="lazy"
                className="w-6 h-6 mr-2"
              />
              <h3 className="text-sm">
                {category.name.replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )}
              </h3>
            </div>
          </li>
        ))}

        <div className="text-center mt-3">
          <Link
            className="cursor-pointer p-2 common-shad rounded-2 gradient-btn text-sm"
            href="all-categories"
          >
            View more categories
          </Link>
        </div>
      </ul>

      {/* ----------- MEGA MENU (SAME UI) ------------- */}
      {categories.map(
        (category) =>
          activeCategory === category._id && (
            <div
              key={category._id}
              className="mega-menu mt-2 p-3 border border-gray-300 rounded-md bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory._id} className="subcategory">
                    <p
                      className="font-semibold mb-0 text-dark-600 hover:underline cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/seller/${category.categoryslug}/${subcategory.subcategoryslug}`
                        )
                      }
                    >
                      <div className="flex items-center">
                        <Image
                          src={
                            subcategory.icon ||
                            "/default-subcategory.png"
                          }
                          alt={subcategory.name}
                          width={24}
                          height={24}
                          className="w-6 h-6"
                          loading="lazy"
                        />
                        <span className="ml-2">
                          {subcategory.name.replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          )}
                        </span>
                      </div>
                    </p>

                    <ul className="text-gray-700">
                      {subcategory.products
                        ?.slice(0, 6)
                        .map((product) => (
                          <li key={product._id}>
                            <Link
                              href={`/manufacturers/${product.productslug}`}
                              className="text-sm text-blue-700 hover:underline"
                            >
                              {product.name.replace(/\b\w/g, (c) =>
                                c.toUpperCase()
                              )}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default SidebarMenu;
