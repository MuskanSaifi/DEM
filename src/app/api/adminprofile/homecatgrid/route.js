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
          select: "name productslug",
          options: { limit: 3 }, // ⭐ only small data for grid
        },
      })
      .limit(5) // ⭐ Home page shows only 5 categories
      .lean();

    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error("Home Category API Error:", error);
    return Response.json(
      { error: "Failed to load home categories" },
      { status: 500 }
    );
  }
}
