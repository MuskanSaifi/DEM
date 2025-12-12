// src/app/api/home/categories/route.js

import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    // Home Page — Only lightweight data
    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .limit(5) // home page only needs first 5
      .populate({
        path: "subcategories",
        select: "name icon subcategoryslug products",
        populate: {
          path: "products",
          select: "name productslug",
          options: { limit: 3 }, // ⭐ only 3 products per subcategory
        },
      })
      .lean();

    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error("HOME CATEGORY API ERROR:", error);
    return Response.json(
      { error: "Failed to load home categories" },
      { status: 500 }
    );
  }
}
