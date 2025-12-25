import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory"; // Assuming you have SubCategory model
import Product from "@/models/Product"; // Assuming you have Product model
import User from "@/models/User"; // Assuming you have User model
import BusinessProfile from "@/models/BusinessProfile"; // Assuming you have BusinessProfile model
import cloudinary from "@/lib/cloudinary"; // Cloudinary config
import { URL } from "url";


export async function GET() {
  try {
    await connectDB();

    // ✅ OPTIMIZED: Fetch categories with LIMITED products per subcategory
    const categories = await Category.find()
      .populate({
        path: "subcategories",
        populate: {
          path: "products",
          select:
            "name description price images productslug tradeShopping userId minimumOrderQuantity currency tags",
          options: { limit: 10 }, // ✅ Limit products per subcategory to prevent CPU spike
          populate: {
            path: "userId",
            model: "User",
            select: "fullname mobileNumber",
          },
        },
      })
      .lean(); // 🔥 Very important for performance

    if (!categories.length) {
      return new Response(JSON.stringify({ message: "No categories found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Collect ALL unique userIds from products
    const userIdSet = new Set();

    for (const category of categories) {
      for (const subcat of category.subcategories || []) {
        for (const product of subcat.products || []) {
          const uid =
            product.userId?._id?.toString() || product.userId?.toString();
          if (uid) userIdSet.add(uid);
        }
      }
    }

    const userIds = [...userIdSet];

    // 3) Fetch ALL BusinessProfiles in ONE query
    const businessProfiles = await BusinessProfile.find({
      userId: { $in: userIds },
    })
      .select(
        "userId companyName address city state country gstNumber trustSealVerified yearOfEstablishment"
      )
      .lean();

    // 4) Create map: userId -> businessProfile
    const bpMap = {};
    for (const bp of businessProfiles) {
      bpMap[bp.userId.toString()] = bp;
    }

    // 5) Attach businessProfile to each product in memory (no extra DB calls)
    for (const category of categories) {
      for (const subcat of category.subcategories || []) {
        for (const product of subcat.products || []) {
          const uid =
            product.userId?._id?.toString() || product.userId?.toString();
          product.businessProfile = uid ? bpMap[uid] || null : null;
        }
      }
    }

    // 6) Return final result
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Optimized Category API Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch categories",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      id,
      name,
      icon, // Base64 string if new icon is uploaded
      categoryslug,
      metatitle,
      metadescription,
      metakeywords,
      content,
      isTrending,
      subcategories,
    } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid category ID." }), {
        status: 400,
      });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return new Response(JSON.stringify({ error: "Category not found." }), { status: 404 });
    }

    let uploadedIconUrl = existingCategory.icon;
    let uploadedIconPublicId = existingCategory.iconPublicId;

    // If a new icon (base64 string) is provided
    if (icon && icon !== existingCategory.icon) {
      try {
        // If there's an old icon associated with a public_id, delete it first
        if (existingCategory.iconPublicId) {
          await cloudinary.uploader.destroy(existingCategory.iconPublicId);
          console.log(`✅ Old icon with public_id ${existingCategory.iconPublicId} deleted from Cloudinary.`);
        }

        const result = await cloudinary.uploader.upload(icon, {
          folder: "categories", // Save in 'categories' folder
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        uploadedIconUrl = result.secure_url;
        uploadedIconPublicId = result.public_id; // ✅ Save the new public_id
      } catch (uploadError) {
        console.error("❌ Cloudinary Upload Error:", uploadError);
        return new Response(JSON.stringify({ error: "Image upload failed." }), { status: 500 });
      }
    }

    const updateFields = {
      name: name?.trim(),
      categoryslug: categoryslug?.trim(),
      metatitle: metatitle?.trim(),
      metadescription: metadescription?.trim(),
      metakeywords: metakeywords?.trim(),
      content: content,
      isTrending: isTrending,
      icon: uploadedIconUrl,
      iconPublicId: uploadedIconPublicId, // ✅ Update iconPublicId
      subcategories: subcategories,
    };

    // Validate if the new slug is unique, excluding the current category itself
    if (categoryslug && categoryslug !== existingCategory.categoryslug) {
      const slugConflict = await Category.findOne({ categoryslug: categoryslug, _id: { $ne: id } });
      if (slugConflict) {
        return new Response(JSON.stringify({ error: "Category slug already exists." }), { status: 409 });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error updating category:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update category." }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      icon,
      iconPublicId, // ✅ Destructure iconPublicId from the body
      categoryslug,
      metatitle,
      metadescription,
      metakeywords,
      content,
      isTrending,
      subcategories,
    } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Name is required." }),
        { status: 400 }
      );
    }

    if (
      subcategories &&
      (!Array.isArray(subcategories) ||
        subcategories.some(
          (subcategory) => !mongoose.Types.ObjectId.isValid(subcategory)
        ))
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid subcategories provided." }),
        { status: 400 }
      );
    }

    if (categoryslug) {
      const existingCategory = await Category.findOne({ categoryslug: categoryslug });
      if (existingCategory) {
        return new Response(
          JSON.stringify({ error: "Category slug already exists. Please choose a different slug." }),
          { status: 409 }
        );
      }
    }

    const newCategory = new Category({
      name: name,
      categoryslug: categoryslug,
      metatitle: metatitle,
      metadescription: metadescription,
      metakeywords: metakeywords,
      icon: icon || null,
      iconPublicId: iconPublicId || null, // ✅ Save iconPublicId here
      content: content || "",
      isTrending: isTrending,
      subcategories: subcategories || [],
    });

    const savedCategory = await newCategory.save();

    return new Response(JSON.stringify(savedCategory), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create category." }),
      { status: 500 }
    );
  }
}



export async function DELETE(req) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Category ID is required" }),
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(id);

    await connectDB();

    const categoryToDelete = await Category.findById(objectId);

    if (!categoryToDelete) {
      return new Response(
        JSON.stringify({ error: "Category not found" }),
        { status: 404 }
      );
    }

    if (categoryToDelete.iconPublicId) {
      console.log(`Attempting to delete image from Cloudinary.`);
      console.log(`Category Name: ${categoryToDelete.name}`);
      console.log(`Cloudinary Public ID to delete: ${categoryToDelete.iconPublicId}`);

      try {
        const result = await cloudinary.uploader.destroy(categoryToDelete.iconPublicId);
        console.log("Cloudinary deletion result:", result);

        if (result.result === "ok") {
          console.log(`✅ Icon with public_id ${categoryToDelete.iconPublicId} successfully deleted from Cloudinary.`);
        } else {
          console.warn(`⚠️ Cloudinary deletion for public_id ${categoryToDelete.iconPublicId} was not 'ok'. Result: ${result.result}`);
        }
      } catch (cloudinaryError) {
        console.error("❌ Error deleting icon from Cloudinary:", cloudinaryError);
        console.error("Cloudinary Error Details:", cloudinaryError.message, cloudinaryError.http_code, cloudinaryError.response);
      }
    } else {
      console.log(`No iconPublicId found for category: ${categoryToDelete.name}. Skipping Cloudinary deletion.`);
    }

    const deletedCategory = await Category.findByIdAndDelete(objectId);

    return new Response(
      JSON.stringify({ message: "Category deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ General Error deleting category:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete category" }),
      { status: 500 }
    );
  }
}