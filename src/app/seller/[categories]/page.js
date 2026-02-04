// app/seller/[categories]/page.js
import React from "react";
import CategoryPage from "./CategoryPage";
import { getSafeMetaContent } from "@/middleware/contentValidation";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// ---------- FETCH CATEGORIES ----------
export async function fetchCategories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
    next: { revalidate: 3600 }, // ✅ ISR: Revalidate every hour
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

// ---------- PAGE WRAPPER ----------
export default async function CategoryPageWrapper({ params }) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.categories;
  return <CategoryPage categorySlug={categorySlug} />;
}

// ---------- SEO / METADATA ----------
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;    // ⭐ FIX: Await params
    const categorySlug = resolvedParams.categories;

    const categories = await fetchCategories();
    const category = categories.find(
      (cat) => cat.categoryslug === categorySlug
    );

    // If category not found ― return 404 SEO
    if (!category) {
      return {
        title: "Category Not Found",
        description: "The requested category does not exist.",
        alternates: {
          canonical: `https://www.dialexportmart.com/seller/not-found`,
        },
      };
    }

    const safeTitle = getSafeMetaContent(category.metatitle) || category.name;
    const safeDesc = getSafeMetaContent(category.metadescription) || `Explore premium ${category.name} products at best prices.`;
    const safeKeywords = getSafeMetaContent(category.metakeywords) || "";

    return {
      title: safeTitle,
      description: safeDesc,
      keywords: safeKeywords,
      alternates: {
        canonical: `https://www.dialexportmart.com/seller/${category.categoryslug}`,
      },
      openGraph: {
        title: safeTitle,
        description: safeDesc || `Explore top-quality ${category.name} products on Dial Export Mart.`,
        url: `https://www.dialexportmart.com/seller/${category.categoryslug}`,
        type: "website",
      },
    };
  } catch (err) {
    console.error("Error fetching metadata:", err);
    return {
      title: "Error",
      description: "An error occurred while fetching metadata.",
    };
  }
}
