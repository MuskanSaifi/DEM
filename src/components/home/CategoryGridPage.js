"use client";

import React, { useEffect, useState } from "react";
import CategoryGridSection from "./CategoryGridSection";

export default function CategoryGridPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const res = await fetch("/api/home/categories", {
          next: { revalidate: 120 },
        });
        const data = await res.json();
        if (mounted) setCategories(data);
      } catch (err) {
        console.error("Category load failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="text-center p-4">Loading...</p>;

  if (!categories.length)
    return <p className="text-center text-gray-500 p-4">No categories found.</p>;

  return <CategoryGridSection categories={categories} />;
}
