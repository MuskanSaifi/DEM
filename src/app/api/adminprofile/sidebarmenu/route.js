import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate({
        path: "subcategories",
        select: "name icon subcategoryslug",
        options: { limit: 6 }, // ✅ safety
        populate: {
          path: "products",
          select: "name productslug",
          options: { limit: 4 }, // ✅ ONLY 4 PRODUCTS
        },
      })
      .lean();

    return Response.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=432000",
      },
    });
  } catch (err) {
    console.error("Sidebar API Error:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
