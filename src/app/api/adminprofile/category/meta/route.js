import connectdb from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function PATCH(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { id, name, metatitle, metadescription, metakeywords, categoryslug } = body;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid category ID." }), {
        status: 400,
      });
    }

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return new Response(JSON.stringify({ error: "Category not found." }), {
        status: 404,
      });
    }

    // Update fields conditionally
    if (name) existingCategory.name = name;
    if (metatitle) existingCategory.metatitle = metatitle;
    if (metadescription) existingCategory.metadescription = metadescription;
    if (metakeywords) existingCategory.metakeywords = metakeywords;
    if (categoryslug) existingCategory.categoryslug = categoryslug; // ✅ Slug update

    const updatedCategory = await existingCategory.save();

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to update category.",
      }),
      { status: 500 }
    );
  }
}
