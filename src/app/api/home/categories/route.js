import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory"; // ✅ MUST IMPORT
import Product from "@/models/Product"; // ✅ because nested populate

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .limit(5)
      .populate({
        path: "subcategories",
        model: "SubCategory", // ✅ explicit model
        select: "name icon subcategoryslug products",
        populate: {
          path: "products",
          model: "Product", // ✅ explicit model
          select: "name productslug",
          options: { limit: 3 },
        },
      })
      .lean();

    return Response.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
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
