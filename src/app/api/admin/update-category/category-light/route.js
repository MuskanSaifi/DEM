import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({})
      .select("name categoryslug icon")
      .sort({ name: 1 })
      .lean();

    return Response.json(categories);
  } catch (error) {
    return Response.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
