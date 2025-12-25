// src/app/api/home/all-categories/route.js
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .lean();

    if (!categories.length) {
      return Response.json([], { status: 200 });
    }

    const subIds = categories.flatMap(c => c.subcategories);

    const subcategories = await SubCategory.find({ _id: { $in: subIds } })
      .select("name subcategoryslug")
      .lean();

    const subMap = Object.fromEntries(
      subcategories.map(s => [s._id.toString(), s])
    );

    const finalData = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      icon: cat.icon,
      categoryslug: cat.categoryslug,
      subcategories: cat.subcategories
        .map(id => subMap[id.toString()])
        .filter(Boolean)
    }));

    return Response.json(finalData, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (err) {
    console.error("All Categories API Error:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
