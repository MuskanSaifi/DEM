import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export async function GET(req) {
  await connectdb();

  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");

    if (!country) {
      return Response.json(
        { success: false, message: "Country missing" },
        { status: 400 }
      );
    }

    // ✅ ALWAYS lowercase (schema already enforces this)
    const cleanCountry = country.toLowerCase();

    // 🚀 FAST QUERY (INDEX USED)
    const products = await Product.find(
      { country: cleanCountry },
      { category: 1, subCategory: 1 }
    ).lean();

    if (!products.length) {
      return Response.json({
        success: true,
        categories: [],
        subcategories: [],
      });
    }

    const categoryIds = [
      ...new Set(products.map(p => p.category?.toString()).filter(Boolean)),
    ];

    const subCategoryIds = [
      ...new Set(products.map(p => p.subCategory?.toString()).filter(Boolean)),
    ];

    const categories = await Category.find(
      { _id: { $in: categoryIds } },
      { name: 1, categoryslug: 1, icon: 1 }
    ).lean();

    const subcategories = await SubCategory.find(
      { _id: { $in: subCategoryIds } },
      { name: 1, category: 1, subcategoryslug: 1, icon: 1 }
    ).lean();

    return Response.json({
      success: true,
      categories,
      subcategories,
    });

  } catch (err) {
    console.error("COUNTRY API ERROR:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
