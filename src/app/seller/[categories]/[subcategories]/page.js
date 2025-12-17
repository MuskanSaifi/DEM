import SubcategoryProductPage from "./SubcategoryProductPage";



// Define fetchCategories function directly
export async function fetchCategories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}



export async function generateMetadata({ params }) {
  try {
      const resolvedParams = await params; // ✅ IMPORTANT

    const { categories, subcategories } = resolvedParams;

    const decodedCategorySlug = decodeURIComponent(categories || "");
    const decodedSubcategorySlug = decodeURIComponent(subcategories || "");

    const categoriesData = await fetchCategories();

    const category = categoriesData.find(
      (cat) =>
        cat.categoryslug.toLowerCase() === decodedCategorySlug.toLowerCase()
    );

    if (!category) {
      return {
        title: "Category Not Found",
        description: "The requested category does not exist.",
      };
    }

    const subcategory = category.subcategories?.find(
      (sub) =>
        sub.subcategoryslug.toLowerCase() ===
        decodedSubcategorySlug.toLowerCase()
    );

    if (!subcategory) {
      return {
        title: "Subcategory Not Found",
        description: "The requested subcategory does not exist.",
        alternates: {
          canonical: `https://www.dialexportmart.com/seller/not-found`,
        },
      };
    }

    return {
      title: subcategory.metatitle || subcategory.name,
      description:
        subcategory.metadescription ||
        `Explore ${subcategory.name} products under ${category.name}.`,
      keywords: subcategory.metakeyword || "",
      alternates: {
        canonical: `https://www.dialexportmart.com/seller/${category.categoryslug}/${subcategory.subcategoryslug}`,
      },
    };
  } catch (error) {
    return {
      title: "Error",
      description: "An error occurred while generating metadata.",
    };
  }
}



export default function Page({ params }) {
  return <SubcategoryProductPage params={params} />;
}
