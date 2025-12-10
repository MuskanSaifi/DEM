import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import SubCategory from "@/models/SubCategory";
import Category from "@/models/Category"; // Import the Category model
import cloudinary from "@/lib/cloudinary";

// ✅ GET API - Fetch all subcategories
export async function GET() {
  try {
    await connectDB();

    // Fetch all subcategories and populate category and products
    const subCategories = await SubCategory.find()
      .populate("category")
      .populate("products");

    return new Response(JSON.stringify(subCategories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subcategories." }),
      { status: 500 }
    );
  }
}

// ✅ DELETE API - Delete subcategory by ID
export async function DELETE(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const subCategoryId = url.searchParams.get("id");

    if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return new Response(
        JSON.stringify({ error: "Invalid subcategory ID." }),
        { status: 400 }
      );
    }

    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return new Response(
        JSON.stringify({ error: "Subcategory not found." }),
        { status: 404 }
      );
    }

    // 1. ✅ Delete the associated image from Cloudinary using stored public_id
    if (subCategory.iconPublicId) { // Check if public_id exists
      console.log(`Attempting to delete subcategory image from Cloudinary: ${subCategory.iconPublicId}`);
      try {
        const result = await cloudinary.uploader.destroy(subCategory.iconPublicId);
        console.log("Cloudinary deletion result:", result);

        if (result.result === "ok") {
          console.log(`✅ Icon with public_id ${subCategory.iconPublicId} successfully deleted from Cloudinary.`);
        } else {
          console.warn(`⚠️ Cloudinary deletion for public_id ${subCategory.iconPublicId} was not 'ok'. Result: ${result.result}`);
        }
      } catch (cloudinaryError) {
        console.error("❌ Error deleting icon from Cloudinary:", cloudinaryError);
        // Log the error but continue with database deletion to avoid breaking the main process
      }
    } else {
      console.log(`No iconPublicId found for subcategory: ${subCategory.name}. Skipping Cloudinary deletion.`);
    }

    // 2. ✅ Remove the subcategory ID from its parent Category's subcategories array
    if (subCategory.category) {
      await Category.findByIdAndUpdate(
        subCategory.category,
        { $pull: { subcategories: subCategoryId } },
        { new: true }
      );
      console.log(`✅ Subcategory ID ${subCategoryId} removed from Category ${subCategory.category}`);
    }

    // 3. Delete subcategory from the database
    await SubCategory.findByIdAndDelete(subCategoryId);

    return new Response(
      JSON.stringify({ message: "Subcategory and associated data deleted successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ General Error deleting subcategory:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete subcategory" }),
      { status: 500 }
    );
  }
}