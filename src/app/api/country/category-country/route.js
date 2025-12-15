// api/country/category-country/route.js
import connectdb from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";

export async function GET(req) {
  await connectdb();

  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country")?.toLowerCase();
    const categorySlug = searchParams.get("category")?.toLowerCase();

    if (!country || !categorySlug) {
      return Response.json({ category: null, subcategories: [] });
    }

    // 🟢 1) Find the category directly by slug
    const categoryData = await Category.findOne(
      { categoryslug: categorySlug },
      { name: 1, categoryslug: 1 }
    ).lean();

    if (!categoryData) {
      return Response.json({ category: null, subcategories: [] });
    }

    // 🟢 2) Fetch products for only this country + this category
    const products = await Product.find(
      {
        country,
        category: categoryData._id,
      },
      { subCategory: 1 } // Only need subCategory ID → FAST
    ).lean();

    if (!products.length) {
      return Response.json({ category: categoryData, subcategories: [] });
    }

    // 🟢 3) Extract unique subcategory IDs
    const subcategoryIds = [
      ...new Set(products.map((p) => p.subCategory?.toString()))
    ].filter(Boolean);

    // 🟢 4) Fetch subcategories in ONE query
    const subcategories = await SubCategory.find(
      { _id: { $in: subcategoryIds } },
      { name: 1, subcategoryslug: 1, icon: 1 }
    ).lean();

    return Response.json(
      { category: categoryData, subcategories },
      { status: 200 }
    );

  } catch (error) {
    console.log(error);
    return Response.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
