// app/api/country/route.js
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
      return Response.json({ success: false, message: "Country missing" });
    }

    const cleanCountry = country.toLowerCase();

    // 🟢 SUPER FAST SEARCH — NO REGEX
    const products = await Product.find(
      { country: cleanCountry },
      { category: 1, subCategory: 1 }
    )
      .lean(); // ⚡ 30% faster

    if (!products.length) {
      return Response.json({
        success: true,
        categories: [],
        subcategories: [],
      });
    }

    // 🟢 Extract unique IDs only once
    const categoryIds = [...new Set(products.map(p => p.category?.toString()))];
    const subcategoryIds = [...new Set(products.map(p => p.subCategory?.toString()))];

    // 🟢 Load all categories in one query
    const categories = await Category.find(
      { _id: { $in: categoryIds } },
      { name: 1, categoryslug: 1, icon: 1 } 
    ).lean();

    // 🟢 Load all subcategories in one query
  const subcategories = await SubCategory.find(
  { _id: { $in: subcategoryIds } },
  {
    name: 1,
    category: 1,
    subcategoryslug: 1,
    icon: 1   // ✅ ADD THIS
  }
).lean();


    return Response.json(
      {
        success: true,
        categories,
        subcategories,
      },
      { status: 200 }
    );

  } catch (error) {
    console.log("API ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
