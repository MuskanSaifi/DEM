import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export async function GET() {
  try {
    await connectDB();

    // ⚡ Light-weight optimized query (NO products populated)
    const categories = await Category.find({})
      .select("name icon categoryslug metatitle metadescription metakeywords createdAt subcategories")
      .sort({ createdAt: -1 })
      .populate({
        path: "subcategories",
        select: "name", // fetch only name to reduce load
      })
      .lean();

    return Response.json(categories);
  } catch (error) {
    console.error("❌ Admin Category API Error:", error);
    return Response.json(
      { error: "Failed to load admin categories" },
      { status: 500 }
    );
  }
}
