// app/seller/[categories]/page.js
import React from "react";
import CategoryPage from "./CategoryPage";

// ---------- FETCH CATEGORIES ----------
export async function fetchCategories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
    cache: "no-store",
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

    return {
      title: category.metatitle || category.name,
      description:
        category.metadescription ||
        `Explore premium ${category.name} products at best prices.`,
      keywords: category.metakeywords || "",
      alternates: {
        canonical: `https://www.dialexportmart.com/seller/${category.categoryslug}`,
      },
      openGraph: {
        title: category.metatitle || category.name,
        description:
          category.metadescription ||
          `Explore top-quality ${category.name} products on Dial Export Mart.`,
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
