"use client";
import React from "react";
import { useSelector } from "react-redux";
import CategoryGridSection from "./CategoryGridSection"; // Adjust path if needed

const CategoryGridPage = () => {
  const { data: allcategories, loading, error } = useSelector((state) => state.categories);

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center text-red-600 p-4">{error}</p>;
  if (!allcategories || allcategories.length === 0) {
    return <p className="text-center text-gray-600 p-4">No categories found.</p>;
  }

  return <CategoryGridSection categories={allcategories} />;
};

export default CategoryGridPage;
