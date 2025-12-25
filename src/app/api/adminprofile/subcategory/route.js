import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary"; // Cloudinary config
import { URL } from "url"; // For DELETE method

// ✅ Function to Upload Image to Cloudinary - MODIFIED to return public_id
const uploadToCloudinary = async (image) => {
  if (typeof image !== "string") {
    throw new Error("❌ Invalid Image Format: Image must be a string (Base64 or URL)");
  }
  // If it's already a Cloudinary URL, we can potentially extract public_id
  // But for new uploads, we will get it from the result
  if (image.startsWith("http://res.cloudinary.com/")) {
    // If it's already a Cloudinary URL and not a new upload,
    // we assume it's an existing image. We might need to parse its public_id
    // from the URL if not explicitly passed, but for now, we'll return its URL
    // and a null public_id as we're not uploading a new one.
    // The PATCH logic will handle keeping the old public_id if no new image is provided.
    // For a *new* upload via base64, the public_id will be in `result.public_id`.
    return { secure_url: image, public_id: null }; // No new public_id from old URL
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "subcategories",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    return { secure_url: result.secure_url, public_id: result.public_id }; // ✅ Return both
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// ✅ PATCH method - Update a subcategory
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, category, products, icon, subcategoryslug, metatitle, metadescription, metakeyword } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid subcategory ID." }), { status: 400 });
    }

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return new Response(JSON.stringify({ error: "Subcategory not found." }), { status: 404 });
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return new Response(JSON.stringify({ error: "Invalid category ID." }), { status: 400 });
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return new Response(JSON.stringify({ error: "Category not found." }), { status: 404 });
      }
    }

    if (products && products.length > 0) {
      const invalidProducts = await Promise.all(
        products.map(async (productId) =>
          mongoose.Types.ObjectId.isValid(productId) && (await Product.findById(productId))
            ? null
            : productId
        )
      );
      const invalidProductIds = invalidProducts.filter((id) => id !== null);
      if (invalidProductIds.length > 0) {
        return new Response(JSON.stringify({ error: `Invalid product IDs: ${invalidProductIds.join(", ")}` }), { status: 400 });
      }
    }

    let uploadedIconUrl = subCategory.icon;
    let uploadedIconPublicId = subCategory.iconPublicId;

    // ✅ If a new icon (base64 string or new URL) is provided, attempt to upload/update it
    if (icon && icon !== subCategory.icon) {
      try {
        // Delete old image from Cloudinary if a public_id exists
        if (subCategory.iconPublicId) {
          console.log(`Attempting to delete old subcategory icon from Cloudinary: ${subCategory.iconPublicId}`);
          const destroyResult = await cloudinary.uploader.destroy(subCategory.iconPublicId);
          console.log("Cloudinary destroy result:", destroyResult);
        }

        // Upload the new image
        const uploadResult = await uploadToCloudinary(icon);
        uploadedIconUrl = uploadResult.secure_url;
        uploadedIconPublicId = uploadResult.public_id; // Store the new public_id
      } catch (uploadError) {
        console.error("❌ Cloudinary Upload/Deletion Error during PATCH:", uploadError);
        // Decide if you want to fail the entire update or proceed without the new image
        // For now, we'll let it proceed but log the error
      }
    } else if (icon === null && subCategory.iconPublicId) { // Case: icon is explicitly set to null (frontend removed it)
      try {
        console.log(`Attempting to delete subcategory icon because it was removed: ${subCategory.iconPublicId}`);
        await cloudinary.uploader.destroy(subCategory.iconPublicId);
        uploadedIconUrl = null;
        uploadedIconPublicId = null;
      } catch (destroyError) {
        console.error("❌ Cloudinary Deletion Error during PATCH (icon set to null):", destroyError);
      }
    }


    subCategory.name = name?.trim() || subCategory.name;
    subCategory.category = category || subCategory.category;
    subCategory.subcategoryslug = subcategoryslug?.trim() || subCategory.subcategoryslug;
    subCategory.metatitle = metatitle?.trim() || subCategory.metatitle;
    subCategory.metadescription = metadescription?.trim() || subCategory.metadescription;
    subCategory.metakeyword = metakeyword?.trim() || subCategory.metakeyword; // Corrected field name

    if (products && products.length > 0) {
      const existingProductIds = subCategory.products.map((id) => id.toString());
      const newProductIds = products.map((id) => id.toString());
      const mergedProducts = Array.from(new Set([...existingProductIds, ...newProductIds]));
      subCategory.products = mergedProducts;
    }

    subCategory.icon = uploadedIconUrl;
    subCategory.iconPublicId = uploadedIconPublicId; // ✅ Update public_id for PATCH

    const updatedSubCategory = await subCategory.save();

    const populatedSubCategory = await SubCategory.findById(updatedSubCategory._id)
      .populate("category")
      .populate("products");

    return new Response(JSON.stringify(populatedSubCategory), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error updating subcategory:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update subcategory." }),
      { status: 500 }
    );
  }
}

// POST method - Create a new subcategory
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      category,
      subcategoryslug,
      metatitle,
      metadescription,
      metakeyword,
      icon,           // ✅ Incoming icon URL
      iconPublicId,   // ✅ Incoming icon Public ID
      products,
    } = body;

    const requiredFields = ["name", "category", "metatitle", "metadescription", "metakeyword", "subcategoryslug"];
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== false) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400 }
        );
      }
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return new Response(
        JSON.stringify({ error: `Invalid category ID format: ${category}` }),
        { status: 400 }
      );
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return new Response(
        JSON.stringify({ error: `Category not found with ID: ${category}` }),
        { status: 400 }
      );
    }

    if (products && products.length > 0) {
      const invalidProducts = [];
      for (const productId of products) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          invalidProducts.push(productId);
          continue;
        }
        const productExists = await Product.findById(productId);
        if (!productExists) {
          invalidProducts.push(productId);
        }
      }
      if (invalidProducts.length > 0) {
        return new Response(
          JSON.stringify({ error: `Invalid product IDs: ${invalidProducts.join(", ")}` }),
          { status: 400 }
        );
      }
    }

    const existingSubCategoryByName = await SubCategory.findOne({
      name: name.trim(),
      category: category,
    });

    if (existingSubCategoryByName) {
      return new Response(
        JSON.stringify({ error: `Subcategory with name "${name}" already exists in this category.` }),
        { status: 400 }
      );
    }

    const existingSubCategoryBySlug = await SubCategory.findOne({
      subcategoryslug: subcategoryslug.trim(),
    });

    if (existingSubCategoryBySlug) {
      return new Response(
        JSON.stringify({ error: `Subcategory with slug "${subcategoryslug}" already exists. Please choose a different slug.` }),
        { status: 400 }
      );
    }

    const newSubCategory = new SubCategory({
      name: name.trim(),
      category: category,
      products: products || [],
      metatitle: metatitle?.trim() || "",
      metadescription: metadescription?.trim() || "",
      metakeyword: metakeyword?.trim() || "",
      subcategoryslug: subcategoryslug.trim(),
      icon: icon || null,             // ✅ Save the icon URL
      iconPublicId: iconPublicId || null, // ✅ Save the icon Public ID
    });

    const savedSubCategory = await newSubCategory.save();

    await Category.findByIdAndUpdate(
      category,
      { $push: { subcategories: savedSubCategory._id } },
      { new: true, runValidators: true }
    );

    const populatedSubCategory = await SubCategory.findById(savedSubCategory._id)
      .populate("category")
      .populate("products");

    return new Response(JSON.stringify(populatedSubCategory), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving subcategory:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save subcategory" }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    let subCategories;

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return new Response(
          JSON.stringify({ error: "Invalid category ID." }),
          { status: 400 }
        );
      }

      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return new Response(
          JSON.stringify({ error: `Category with ID ${categoryId} not found.` }),
          { status: 404 }
        );
      }

      subCategories = await SubCategory.find({ category: categoryId })
        .populate("category")
        .populate({
          path: "products",
          populate: { path: "userId", model: User, select: "fullname email" },
        });
    } else {
      subCategories = await SubCategory.find()
        .populate("category")
        .populate({
          path: "products",
          populate: { path: "userId", model: User, select: "fullname email" },
        });
    }

    return new Response(
      JSON.stringify(subCategories),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch subcategories." }),
      { status: 500 }
    );
  }
}

// ✅ DELETE method - Delete a subcategory
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "SubCategory ID is required" }),
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(id);

    await connectDB();

    const subCategoryToDelete = await SubCategory.findById(objectId);

    if (!subCategoryToDelete) {
      return new Response(
        JSON.stringify({ error: "SubCategory not found" }),
        { status: 404 }
      );
    }

    // 1. If there's an icon associated, attempt to delete it from Cloudinary
    if (subCategoryToDelete.iconPublicId) {
      console.log(`Attempting to delete subcategory image from Cloudinary.`);
      console.log(`SubCategory Name: ${subCategoryToDelete.name}`);
      console.log(`Cloudinary Public ID to delete: ${subCategoryToDelete.iconPublicId}`);

      try {
        const result = await cloudinary.uploader.destroy(subCategoryToDelete.iconPublicId);
        console.log("Cloudinary deletion result:", result);

        if (result.result === "ok") {
          console.log(`✅ Icon with public_id ${subCategoryToDelete.iconPublicId} successfully deleted from Cloudinary.`);
        } else {
          console.warn(`⚠️ Cloudinary deletion for public_id ${subCategoryToDelete.iconPublicId} was not 'ok'. Result: ${result.result}`);
        }
      } catch (cloudinaryError) {
        console.error("❌ Error deleting icon from Cloudinary:", cloudinaryError);
        console.error("Cloudinary Error Details:", cloudinaryError.message, cloudinaryError.http_code, cloudinaryError.response);
        // Decide whether to throw the error or proceed with database deletion even if Cloudinary fails.
        // For now, it will proceed to delete from DB.
      }
    } else {
      console.log(`No iconPublicId found for subcategory: ${subCategoryToDelete.name}. Skipping Cloudinary deletion.`);
    }

    // 2. Remove subcategory from its parent category's subcategories array
    if (subCategoryToDelete.category) {
      await Category.findByIdAndUpdate(
        subCategoryToDelete.category,
        { $pull: { subcategories: subCategoryToDelete._id } }
      );
      console.log(`Removed subcategory ${subCategoryToDelete.name} from parent category ${subCategoryToDelete.category}.`);
    }

    // 3. Delete the subcategory from the database
    const deletedSubCategory = await SubCategory.findByIdAndDelete(objectId);

    return new Response(
      JSON.stringify({ message: "SubCategory deleted successfully" }),
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