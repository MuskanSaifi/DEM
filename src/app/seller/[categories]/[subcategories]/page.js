import SubcategoryProductPage from "./SubcategoryProductPage";
import { notFound } from "next/navigation";
import { getSafeMetaContent } from "@/middleware/contentValidation";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Block SEO spam: slugs like "video-da0sqrh3-Qjpei14VE" (random alphanumeric)
// Real subcategory slugs are letters + hyphens only, e.g. "ladies-kurtis", "handicrafts"
const isValidSubcategorySlug = (slug) => {
  if (!slug || slug.length > 50) return false;
  return /^[a-z]+(-[a-z]+)*$/.test(slug.toLowerCase());
};

// Define fetchCategories function directly
export async function fetchCategories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
    next: { revalidate: 3600 }, // ✅ ISR: Revalidate every hour
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}



export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const { categories, subcategories } = resolvedParams;

    const decodedCategorySlug = decodeURIComponent(categories || "");
    const decodedSubcategorySlug = decodeURIComponent(subcategories || "");

    if (!isValidSubcategorySlug(decodedSubcategorySlug)) {
      return {
        title: "Page Not Found | Dial Export Mart",
        robots: { index: false, follow: false },
      };
    }

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
        title: "Subcategory Not Found | Dial Export Mart",
        description: "The requested subcategory does not exist.",
        robots: { index: false, follow: false },
        alternates: {
          canonical: `https://www.dialexportmart.com/seller/not-found`,
        },
      };
    }

    const safeTitle = getSafeMetaContent(subcategory.metatitle) || subcategory.name;
    const safeDesc = getSafeMetaContent(subcategory.metadescription) || `Explore ${subcategory.name} products under ${category.name}.`;
    const safeKeywords = getSafeMetaContent(subcategory.metakeyword) || "";

    return {
      title: safeTitle,
      description: safeDesc,
      keywords: safeKeywords,
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



export default async function Page({ params }) {
  const resolvedParams = await params;
  const subcategorySlug = decodeURIComponent(resolvedParams?.subcategories || "");
  if (!isValidSubcategorySlug(subcategorySlug)) {
    notFound();
  }
  return <SubcategoryProductPage params={params} />;
}
