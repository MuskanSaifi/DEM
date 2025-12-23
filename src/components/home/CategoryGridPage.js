"use client";

import React, { useEffect, useState, useRef } from "react";
import CategoryGridSection from "./CategoryGridSection";

export default function CategoryGridPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    // ✅ OPTIMIZED: Create AbortController for request cancellation
    abortControllerRef.current = new AbortController();

    const loadCategories = async () => {
      try {
        // ✅ OPTIMIZED: Use cache and add timeout
        const res = await fetch("/api/home/categories", {
          cache: "force-cache", // ✅ Use browser cache
          signal: abortControllerRef.current.signal, // ✅ Allow cancellation
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        if (mounted) setCategories(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Category load failed:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      mounted = false;
      // ✅ Cancel request if component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (loading) return <p className="text-center p-4">Loading...</p>;

  if (!categories.length)
    return <p className="text-center text-gray-500 p-4">No categories found.</p>;

  return <CategoryGridSection categories={categories} />;
}
