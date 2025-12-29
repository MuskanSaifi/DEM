// api/home/appapi/homeproducts/route.js
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .limit(6)
      .populate({
        path: "subcategories",
        model: "SubCategory",
        select: "name icon subcategoryslug products",
        populate: {
          path: "products",
          model: "Product",
          select: "name productslug images",
         options: { limit: 30 }, // ✅ mobile safe limit
        },
      })
      .lean();

    return Response.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("HOME CATEGORY API ERROR:", error);
    return Response.json(
      { error: "Failed to load home categories" },
      { status: 500 }
    );
  }
}
