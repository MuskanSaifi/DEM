import React from "react";
import CategoryPage from "./CategoryPage";

// Define fetchCategories function directly
export async function fetchCategories() {
  const response = await fetch(`https://www.dialexportmart.com/api/adminprofile/category`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export default async function CategoryPageWrapper({ params }) {
  // Await params to ensure it is fully resolved
  const resolvedParams = await params;
  const categorySlug = resolvedParams?.categories || null;

  // Pass server-side props to the client component
  return <CategoryPage categorySlug={categorySlug} />;
}

export async function generateMetadata({ params }) {
  try {
    // Await params to ensure it is fully resolved
    const resolvedParams = await params;
    const categorySlug = resolvedParams?.categories || null;

    const categories = await fetchCategories();
    const category = categories.find((cat) => cat.categoryslug === categorySlug);

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
      description: category.metadescription || `Explore ${category.name} products.`,
      keywords: category.metakeywords || "",
      alternates: {
        canonical: `https://www.dialexportmart.com/seller/${category.categoryslug}`,
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
