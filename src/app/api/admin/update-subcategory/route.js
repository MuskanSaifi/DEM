import connectDB from "@/lib/dbConnect";
import SubCategory from "@/models/SubCategory";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const subcategories = await SubCategory.find({})
      .select("name icon category")      // ONLY required fields
      .populate({
        path: "category",
        select: "name",                   // Only category name/id
      })
      .lean();                            // Super performance boost

    return Response.json(subcategories);
  } catch (error) {
    console.error("Subcategory Error:", error);
    return Response.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}
