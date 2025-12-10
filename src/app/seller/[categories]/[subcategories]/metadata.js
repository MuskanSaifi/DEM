// app/seller/[categories]/[sub-categories]/metadata.js

export async function generateMetadata({ params }) {
    const categorySlug = decodeURIComponent(params.categories);
    const subcategorySlug = decodeURIComponent(params["sub-categories"]);
  
    // You can replace this with a real API call if needed
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/adminprofile/category`, {
      cache: "no-store",
    });
  
    const categories = await response.json();
    const category = categories.find((c) => c.categoryslug === categorySlug);
    const subcategory = category?.subcategories.find((sub) => sub.subcategoryslug === subcategorySlug);
  
    const formattedCategory = category?.name || categorySlug.replace(/-/g, " ");
    const formattedSubcategory = subcategory?.name || subcategorySlug.replace(/-/g, " ");
  
    return {
      title: `${formattedSubcategory} | ${formattedCategory} | Seller`,
      description: `Browse top-quality ${formattedSubcategory} products under ${formattedCategory}.`,
    };
  }
  