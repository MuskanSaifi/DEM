"use client";

import React, { useEffect, useState } from "react";
import CategoryGridSection from "./CategoryGridSection";

export default function CategoryGridPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/home/categories", {
          cache: "no-store",
        });
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Home Category Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) return <p className="text-center p-4">Loading...</p>;

  if (!categories.length)
    return <p className="text-center text-gray-500 p-4">No categories found.</p>;

  return <CategoryGridSection categories={categories} />;
}
