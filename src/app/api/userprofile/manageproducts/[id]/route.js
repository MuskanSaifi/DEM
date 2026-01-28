import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/requireSignIn";
import Product from "@/models/Product";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary"; // This imports the configured cloudinary.v2 instance
import SubCategory from "@/models/SubCategory";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import { validateContent } from "@/middleware/contentValidation";
import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";

// ✅ Helper function to check admin authentication
const checkAdminAuth = async (req) => {
  try {
    const token = req.cookies.get("adminToken")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    return admin || null;
  } catch (err) {
    return null;
  }
};
// ✅ Upload Image to Cloudinary Function
const uploadToCloudinary = async (image) => {
    // This check is refined: Ensure it's a string and starts with data:image
    if (typeof image !== 'string' || !image.startsWith("data:image")) {
        // If it's not a data URL (base64), it means it's likely an already uploaded image URL
        // or some other malformed data. In this context, we only upload new base64 images.
        // Return null or throw an error if you want to strictly reject non-data URLs here.
        // For now, returning null will allow Promise.all to continue, and we'll filter it later.
        console.warn("Attempted to upload a non-base64 image data:", image);
        return null;
    }

    try {
        // Use cloudinary.uploader directly because "@/lib/cloudinary" already exports cloudinary.v2
        const result = await cloudinary.uploader.upload(image, {
            folder: "products",
            resource_type: "image",
            transformation: [{ width: 500, height: 500, crop: "limit" }],
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        throw new Error("Image upload failed");
    }
};

// ✅ PATCH: Update Product
export async function PATCH(req) {
    try {
        await connectdb();
        const user = await requireSignIn(req);
        const admin = await checkAdminAuth(req);
        
        // Allow either user (product owner) or admin
        if (!user && !admin) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        const { productId, images = [], ...updateFields } = body; // 'images' here contains new base64 strings OR existing image objects from frontend

        if (!productId) {
            return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
        }

        // ✅ SECURITY: Validate content for malicious patterns
        try {
          if (updateFields.name) validateContent(updateFields.name, 'name');
          if (updateFields.description) validateContent(updateFields.description, 'description');
          if (updateFields.metaTitle) validateContent(updateFields.metaTitle, 'metaTitle');
          if (updateFields.metaDescription) validateContent(updateFields.metaDescription, 'metaDescription');
          if (updateFields.metaKeywords) validateContent(updateFields.metaKeywords, 'metaKeywords');
        } catch (validationError) {
          console.error("❌ Content validation failed:", validationError.message);
          return NextResponse.json({ 
            success: false, 
            message: validationError.message || "Malicious content detected. Please remove inappropriate content." 
          }, { status: 400 });
        }

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        // Separate existing images from new images to upload
        // Assuming existing images sent from frontend will be objects { url: ..., public_id: ... }
        // And new images will be base64 strings
        const existingImagesFromPayload = images.filter(img => typeof img === 'object' && img !== null && img.url);
        const newImagesToUpload = images.filter(img => typeof img === 'string' && img.startsWith("data:image"));

        // Combine truly existing images from DB with existing images sent from frontend (if any were removed, this needs more complex logic)
        // For simplicity, let's assume the frontend sends ALL current images (existing and new ones to add) in the 'images' array.
        // Or, if frontend only sends *new* images, then `existingImages` from DB is correct.
        // The original code uses `existingProduct.images`, which is safer assuming frontend sends only *new* images.
        const currentDbImages = existingProduct.images || [];

        // ✅ Image Limit Check: Check against current DB images + new images to upload
        const totalImagesAfterUpload = currentDbImages.length + newImagesToUpload.length;
        if (totalImagesAfterUpload > 4) {
            return NextResponse.json({
                success: false,
                message: "Image upload limit exceeded (Max 4 images allowed)",
            }, { status: 400 });
        }

        // ✅ Upload new images
        const uploadedImages = await Promise.all(
            newImagesToUpload.map(async (img) => await uploadToCloudinary(img))
        );

        // Filter out any nulls if uploadToCloudinary returns null for invalid inputs
        const validUploadedImages = uploadedImages.filter(img => img !== null && img.url);

        // Construct the final array of images for the product
        // This assumes existing images are fetched from the DB, and new ones are uploaded.
        // If the frontend also sends back existing image *objects* that haven't changed,
        // you would need to merge `currentDbImages` with `existingImagesFromPayload` carefully
        // to avoid duplicates or to handle removals.
        // For now, we are adding new uploaded images to the existing images from the DB.
        const finalImages = [
            ...currentDbImages, // Images already associated with the product in the database
            ...validUploadedImages // Newly uploaded images
        ];

        updateFields.images = finalImages;

        // ✅ Normalize country to lowercase (ISO codes should be lowercase)
        // ✅ Keep state and city in original case (full names should be preserved)
        if (updateFields.country) {
            updateFields.country = updateFields.country.toLowerCase().trim();
        }
        if (updateFields.state) {
            updateFields.state = updateFields.state.trim(); // Keep original case for full state names
        }
        if (updateFields.city) {
            updateFields.city = updateFields.city.trim(); // Keep original case for city names
        }

        // ✅ Handle SubCategory change: Remove from old, add to new
        const oldSubCategoryId = existingProduct.subCategory?.toString() || existingProduct.subCategory;
        const newSubCategoryId = updateFields.subCategory?.toString() || updateFields.subCategory || null;
        
        // Case 1: Subcategory is being changed (old exists, new is different)
        if (oldSubCategoryId && newSubCategoryId && oldSubCategoryId !== newSubCategoryId) {
            // Validate new subcategory exists
            const newSubCategory = await SubCategory.findById(newSubCategoryId);
            if (!newSubCategory) {
                return NextResponse.json({ 
                    success: false, 
                    message: "Invalid subcategory ID" 
                }, { status: 400 });
            }
            
            // Remove product ID from old subcategory's products array
            await SubCategory.findByIdAndUpdate(
                oldSubCategoryId, 
                { $pull: { products: productId } }
            );
            
            // Add product ID to new subcategory's products array
            await SubCategory.findByIdAndUpdate(
                newSubCategoryId, 
                { $addToSet: { products: productId } } // $addToSet prevents duplicates
            );
        }
        // Case 2: Subcategory is being removed (old exists, new is null/empty)
        else if (oldSubCategoryId && !newSubCategoryId) {
            // Remove product ID from old subcategory's products array
            await SubCategory.findByIdAndUpdate(
                oldSubCategoryId, 
                { $pull: { products: productId } }
            );
        }
        // Case 3: Subcategory is being added (old doesn't exist, new exists)
        else if (!oldSubCategoryId && newSubCategoryId) {
            // Validate new subcategory exists
            const newSubCategory = await SubCategory.findById(newSubCategoryId);
            if (!newSubCategory) {
                return NextResponse.json({ 
                    success: false, 
                    message: "Invalid subcategory ID" 
                }, { status: 400 });
            }
            
            // Add product ID to new subcategory's products array
            await SubCategory.findByIdAndUpdate(
                newSubCategoryId, 
                { $addToSet: { products: productId } } // $addToSet prevents duplicates
            );
        }
        // Case 4: No change (old === new) - do nothing

        // ✅ If admin, allow updating any product. If user, only their own products.
        const query = admin 
            ? { _id: productId } 
            : { _id: productId, userId: user.id };
        
        const updatedProduct = await Product.findOneAndUpdate(
            query,
            { $set: updateFields },
            { new: true }
        );
        
        if (!updatedProduct) {
            return NextResponse.json({ 
                success: false, 
                message: "Product not found or you don't have permission to update it" 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Error updating product:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

// ... (DELETE route remains unchanged as it seems fine)

// ✅ DELETE: Delete Product and its Cloudinary images
export async function DELETE(req, context) {
     const params = await context.params; // await required
  const { id } = params;
  try {
    await connectdb();

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (err) {
            console.warn(`Failed to delete Cloudinary image: ${image.public_id}`);
          }
        }
      }
    }

    // delete from DB
    await Product.findByIdAndDelete(id);

    // remove from user and subcategory
    if (product.userId) {
      await User.findByIdAndUpdate(product.userId, { $pull: { products: id } });
    }

    if (product.subCategory) {
      await SubCategory.findByIdAndUpdate(product.subCategory, { $pull: { products: id } });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

