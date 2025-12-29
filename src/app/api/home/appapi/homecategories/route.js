// api/home/appapi/homecategories/route.js
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate({
        path: "subcategories",
        select: "name icon subcategoryslug products",
        populate: {
          path: "products",
          select: "name productslug images",
          options: { limit: 30 }, // ✅ mobile safe limit
        },
      })
      .lean();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("APP CATEGORY API ERROR:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load app categories" }),
      { status: 500 }
    );
  }
}
