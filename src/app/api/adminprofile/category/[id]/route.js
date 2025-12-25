import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import mongoose from "mongoose";

export async function GET(req, context) {
  try {
    await connectDB();

    // ✅ FIX: await params first
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const category = await Category.findById(id)
      .populate("subcategories", "name")
      .lean();

    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    return Response.json(category);
  } catch (error) {
    console.error("❌ Category details error:", error);
    return Response.json(
      { error: "Failed to fetch category details" },
      { status: 500 }
    );
  }
}
