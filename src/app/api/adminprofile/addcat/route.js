import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name subcategories")
      .populate("subcategories", "name")
      .lean();

    return Response.json(categories);
  } catch (error) {
    console.error("Light Category API Error:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
