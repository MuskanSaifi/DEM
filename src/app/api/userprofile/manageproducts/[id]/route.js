import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/requireSignIn";
import Product from "@/models/Product";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary"; // This imports the configured cloudinary.v2 instance
import SubCategory from "@/models/SubCategory";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
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
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        const { productId, images = [], ...updateFields } = body; // 'images' here contains new base64 strings OR existing image objects from frontend

        if (!productId) {
            return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
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

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, userId: user.id },
            { $set: updateFields },
            { new: true }
        );

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

