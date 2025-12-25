// api/adminprofile/seller/route.js
import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import mongoose from "mongoose"; //

// GET method - Fetch all products
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({})
      .select("name createdAt subCategory userId") // fetch only required fields
      .populate({
        path: "userId",
        select: "fullname",           // Lightweight user info
      })
      .populate({
        path: "subCategory",
        select: "name",               // Only subcategory name
      })
      .lean();

    return Response.json(products);
  } catch (error) {
    console.error("Product Error:", error);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}


// POST method - Create a new product
export async function POST(req) {
  try {
    
    const body = await req.json();

    // Required fields validation
    const requiredFields = ["name", "description", "price", "category", "brand", "countInStock"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400 }
        );
      }
    }

    // Additional field validations
    if (body.price < 0) throw new Error("Price must be a positive number");
    if (body.rating && (body.rating < 0 || body.rating > 5)) throw new Error("Rating must be between 0 and 5");
    if (body.images && body.images.length > 5) throw new Error("You can upload a maximum of 5 images");

    // Validate image URLs (optional, for better consistency)
    if (body.images) {
      for (let img of body.images) {
        if (typeof img !== "string" || !img.startsWith("http")) {
          throw new Error("Invalid image URL");
        }
      }
    }

    await connectDB();

    // Validate category existence
    const categoryExists = await Category.findById(body.category);
    if (!categoryExists) throw new Error("Invalid category ID");

    // Validate subCategory existence (if provided)
    if (body.subCategory) {
      const subCategoryExists = await SubCategory.findById(body.subCategory);
      if (!subCategoryExists) throw new Error("Invalid subCategory ID");
    }

    // Create and save the new product
    const newProduct = new Product({
      name: body.name.trim(),
      description: body.description.trim(),
      price: body.price,
      images: body.images || [],
      category: body.category,
      subCategory: body.subCategory || null,
      available: body.available ?? true,
      quantity: body.quantity ?? 0,
      brand: body.brand.trim(),
      countInStock: body.countInStock,
      rating: body.rating || 0,
      numReviews: body.numReviews || 0,
      tags: body.tags || [],
      featured: body.featured || false,
      discount: body.discount || 0,
      sku: body.sku || null,
    });

    const savedProduct = await newProduct.save();

    return new Response(JSON.stringify(savedProduct), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving product:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save product" }),
      { status: 500 }
    );
  }
}



// DELETE method - Delete a product by ID
export async function DELETE(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const productId = url.searchParams.get("id"); // Get product ID from query parameter

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return new Response(JSON.stringify({ error: "Invalid product ID." }), {
        status: 400,
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return new Response(JSON.stringify({ error: "Product not found." }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Product deleted successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete product." }),
      { status: 500 }
    );
  }
}