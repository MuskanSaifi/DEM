"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/store/categorySlice";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CategoryList() {
  const dispatch = useDispatch();
  const router = useRouter();

  // ⬇️ Using Redux State
  const { data: categories, loading, error } = useSelector(
    (state) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Loader UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold mt-4">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="py-10 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-700 drop-shadow-sm">
          Browse Categories
        </h2>

        {!categories || categories.length === 0 ? (
          <p className="text-center text-gray-500">No categories available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer"
                onClick={() =>
                  router.push(`/seller/${category.categoryslug}`)
                }
              >
                {/* Category Image */}
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden p-3 shadow-md mb-4">
                  <Image
                    src={category.icon || "/no-image.png"}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>

                {/* Category Name */}
                <h3 className="text-xl font-semibold text-indigo-600 text-center mb-3">
                  {category.name}
                </h3>

                {/* Subcategories */}
                {category.subcategories?.length > 0 && (
                  <div
                    className="flex flex-col gap-2 overflow-y-auto mt-3"
                    style={{ maxHeight: "180px" }}
                  >
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/seller/${category.categoryslug}/${sub.subcategoryslug}`
                          );
                        }}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-200 transition cursor-pointer"
                      >
                        <Image
                          src={sub.icon || "/no-image.png"}
                          alt={sub.name}
                          width={22}
                          height={22}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                        {sub.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
