"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function CategoryList() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/home/all-categories", { cache: "no-store" });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Category List Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ⭐ SKELETON LOADER
  if (loading) {
    return (
      <SkeletonTheme baseColor="#e9e9e9" highlightColor="#f5f5f5">
        <div className="py-10 px-6 bg-gray-50 min-h-screen">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-purple-700">
              Browse Categories
            </h2>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(12)
                .fill()
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-2xl shadow border border-gray-200"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden p-2">
                      <Skeleton circle height={80} width={80} />
                    </div>

                    <div className="mt-4 mb-3 text-center">
                      <Skeleton width={120} height={20} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Skeleton height={18} width="60%" />
                      <Skeleton height={18} width="50%" />
                      <Skeleton height={18} width="70%" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  // ⭐ ACTUAL DATA UI
  return (
    <div className="py-10 px-6 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-700">
          Browse Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
              onClick={() => router.push(`/seller/${category.categoryslug}`)}
            >
              <div className="w-20 h-20 mx-auto overflow-hidden rounded-full shadow p-2 bg-gray-100">
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>

              <h3 className="text-lg font-bold text-purple-700 text-center my-3">
                {category.name}
              </h3>

              <div className="flex flex-col gap-2">
                {category.subcategories.slice(0, 5).map((sub) => (
                  <div
                    key={sub._id}
                    className="bg-purple-100 px-3 py-1 text-purple-700 rounded-full text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/seller/${category.categoryslug}/${sub.subcategoryslug}`
                      );
                    }}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
