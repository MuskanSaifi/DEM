import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/requireSignIn";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import User from "@/models/User";

import cloudinary from "@/lib/cloudinary"; // Import Cloudinary config

// ✅ Upload Image to Cloudinary Function
const uploadToCloudinary = async (image) => {
  if (typeof image !== "string") {
    throw new Error("❌ Invalid Image Format: Image must be a string (Base64 or URL)");
  }

  if (image.startsWith("http")) {
    return { url: image, public_id: null }; // No public_id for existing URL
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "products", // Save images in a folder named "products"
      transformation: [{ width: 500, height: 500, crop: "limit" }], // Resize image
    });

    return {
      url: result.secure_url,
      public_id: result.public_id, // ✅ Save public_id
    };
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
};

export async function POST(req) {
  try {
    await connectdb();

    // ✅ Authorization
    const user = await requireSignIn(req);
    if (!user) {
      console.error("❌ Authorization failed. User not found.");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ✅ JSON Parsing with Error Handling
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("❌ JSON Parsing Error:", error);
      return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 });
    }

    // ✅ Extracting Fields
    const {
      name,
      productslug,
      price,
      currency,
      minimumOrderQuantity,
      moqUnit,
      images,
      country,
      state,
      city,
      description = "",
      category,
      subCategory,
      stock = 0,
      tradeInformation = {},
      specifications = {},
      tradeShopping = {},
    } = body;

    // ✅ Validate Required Fields
    if (!name || !minimumOrderQuantity || !Array.isArray(images) || images.length === 0) {
      console.error("❌ Missing required fields:", { name, minimumOrderQuantity, images });
      return NextResponse.json({ success: false, message: "Required fields are missing" }, { status: 400 });
    }

    if (images.length > 5) {
      console.error("❌ Too many images:", images.length);
      return NextResponse.json({ success: false, message: "You can upload up to 5 images only" }, { status: 400 });
    }

    // --- START: Changes for sellingPriceType and fixedSellingPrice ---

    let finalSellingPriceType = null; // Default to null as per schema
    let fixedSellingPrice = null;
    let slabPricing = [];

    // Only process if tradeShopping.sellingPriceType is provided and is a valid enum value
    if (tradeShopping.sellingPriceType && ["Fixed", "Slab Based"].includes(tradeShopping.sellingPriceType)) {
      finalSellingPriceType = tradeShopping.sellingPriceType;

      if (finalSellingPriceType === "Fixed") {
        // Allow fixedSellingPrice to be null if not provided, but validate if present
        if (tradeShopping.fixedSellingPrice !== undefined && tradeShopping.fixedSellingPrice !== null && tradeShopping.fixedSellingPrice !== '') {
          const parsedPrice = Number(tradeShopping.fixedSellingPrice);
          if (isNaN(parsedPrice)) {
            return NextResponse.json({ success: false, message: "Fixed selling price must be a valid number" }, { status: 400 });
          }
          fixedSellingPrice = parsedPrice;
        }
      } else if (finalSellingPriceType === "Slab Based") {
        if (!Array.isArray(tradeShopping.slabPricing) || tradeShopping.slabPricing.length === 0) {
          slabPricing = []; // Allow empty array if no slabs provided for Slab Based
        } else {
          let validationFailed = false;
          for (let i = 0; i < tradeShopping.slabPricing.length; i++) {
            const slab = tradeShopping.slabPricing[i];
            // Ensure all slab fields are present and valid numbers
            if (isNaN(Number(slab.minQuantity)) || isNaN(Number(slab.maxQuantity)) || isNaN(Number(slab.price))) {
                validationFailed = true;
                return NextResponse.json({ success: false, message: `Slab ${i + 1} has invalid numerical values.` }, { status: 400 });
            }
            if (Number(slab.minQuantity) >= Number(slab.maxQuantity)) {
              validationFailed = true;
              return NextResponse.json({ success: false, message: `Slab ${i + 1}: Min quantity must be less than max quantity` }, { status: 400 });
            }
          }
          if (!validationFailed) {
            // Convert slab values to numbers
            slabPricing = tradeShopping.slabPricing.map(slab => ({
                minQuantity: Number(slab.minQuantity),
                maxQuantity: Number(slab.maxQuantity),
                price: Number(slab.price)
            }));
          }
        }
      }
    } else {
        // If sellingPriceType is not provided or is invalid, set it to null
        finalSellingPriceType = null;
    }
    // --- END: Changes for sellingPriceType and fixedSellingPrice ---


    // ✅ Validate Category & SubCategory
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json({ success: false, message: "Invalid category ID" }, { status: 400 });
    }

    let subCategoryExists = null;
    if (subCategory) {
      subCategoryExists = await SubCategory.findById(subCategory);
      if (!subCategoryExists) {
        return NextResponse.json({ success: false, message: "Invalid subCategory ID" }, { status: 400 });
      }
    }

    // Ensure images array contains valid strings
    const validImages = images.map((img) => {
      if (typeof img === "string") return img; // Already valid
      if (typeof img === "object" && img.url) return img.url; // Extract URL
      throw new Error("❌ Invalid Image Data: Each image must be a Base64 string or URL");
    });


    const imageUrls = await Promise.all(validImages.map(uploadToCloudinary));

    // ✅ Create & Save Product
    const newProduct = new Product({
      userId: user.id,
      name,
      productslug,
      price,
      currency,
      minimumOrderQuantity,
      moqUnit,
      images: imageUrls.map(({ url, public_id }) => ({ url, public_id })),
      country,
      state,
      city,
      description,
      category: categoryExists._id,
      subCategory: subCategoryExists ? subCategoryExists._id : null,
      stock,
      tradeInformation,
      specifications: {
        ...specifications,
        foldable: specifications.foldable === "Yes",
      },
      tradeShopping: {
        sellingPriceType: finalSellingPriceType, // Use the validated/defaulted type
        gst: Number(tradeShopping.gst) || null,
        fixedSellingPrice: fixedSellingPrice, // Use the processed fixedSellingPrice
        slabPricing, // Use the processed slabPricing
        isReturnable: tradeShopping.isReturnable === "Yes" ? "Yes" : "No",
        shippingType: tradeShopping.shippingType || "Free", // Default to "Free"
        packageDimensions: {
          length: Number(tradeShopping.packageDimensions?.length) || null,
          width: Number(tradeShopping.packageDimensions?.width) || null,
          height: Number(tradeShopping.packageDimensions?.height) || null,
          unit: tradeShopping.packageDimensions?.unit || "cm",
        },
      },

    });

    console.log("Saving product with images:", imageUrls.map(({ url, public_id }) => ({ url, public_id })));
    await newProduct.save();
    await User.findByIdAndUpdate(user.id, { $push: { products: newProduct._id } });

    return NextResponse.json({ success: true, message: "Product created successfully", data: newProduct }, { status: 201 });

  } catch (error) {
    console.error("❌ Error creating product:", error);
    // More specific error message for validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectdb();
    const user = await requireSignIn(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

  const products = await Product.find({ userId: user.id })
  .populate("category", "name") // only get the name field from Category
  .populate("subCategory", "name"); // only get the name field from SubCategory


    if (!products.length) {
      return NextResponse.json({ success: true, products: [] }, { status: 200 });
    }
    
    const productsWithDetails = products.map((product) => {
      // ✅ Ensure Image URL from Cloudinary or Placeholder
      let imageUrl = "https://via.placeholder.com/500"; // Default placeholder if no image exists
      if (product.images.length > 0 && product.images[0].url) {
        imageUrl = product.images[0].url; // Use Cloudinary URL directly
      }

      // ✅ Check if product has required details
      const hasDetails =
        product.price &&
        product.category &&
        product.description &&
        product.images.length > 0 &&
        Object.keys(product.specifications || {}).length > 0;

      // ✅ Improve Product Strength Calculation
      let strength = "Low";
      if ((product.stock > 50 || product.salesCount > 100) && hasDetails) {
        strength = "High";
      } else if ((product.stock > 20 || product.salesCount > 50) && hasDetails) {
        strength = "Medium";
      } else if (hasDetails) {
        strength = "Medium"; // Upgraded from Low to Medium if details exist
      }

      return { ...product._doc, image: imageUrl, strength };
    });

    return NextResponse.json({ success: true, products: productsWithDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

