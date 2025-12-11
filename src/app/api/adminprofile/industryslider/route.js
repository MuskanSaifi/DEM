import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";


export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate("subcategories", "name icon subcategoryslug")
      .lean();

    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error("Category API Error:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
