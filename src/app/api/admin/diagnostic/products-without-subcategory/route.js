// API endpoint to find products without subcategory
// GET /api/admin/diagnostic/products-without-subcategory

import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";

export async function GET(req) {
  try {
    await connectdb();

    // Find all products without subcategory
    // ✅ Use aggregation to avoid ObjectId casting errors for empty strings
    const productsWithoutSubcategoryRaw = await Product.aggregate([
      {
        $match: {
          $or: [
            { subCategory: null },
            { subCategory: { $exists: false } },
            { $expr: { $eq: [{ $type: '$subCategory' }, 'string'] } }, // Empty strings
            { $expr: { $eq: [{ $toString: '$subCategory' }, ''] } } // Convert to string and check
          ]
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          productslug: 1,
          city: 1,
          state: 1,
          createdAt: 1,
          category: { $arrayElemAt: ['$categoryData', 0] },
          categoryId: { $arrayElemAt: ['$categoryData._id', 0] }, // Include category ID
          userId: {
            _id: { $arrayElemAt: ['$userData._id', 0] },
            fullname: { $arrayElemAt: ['$userData.fullname', 0] },
            email: { $arrayElemAt: ['$userData.email', 0] }
          }
        }
      }
    ]);

    // ✅ Format the results to match expected structure
    const productsWithoutSubcategory = productsWithoutSubcategoryRaw.map(p => ({
      ...p,
      category: p.category ? { name: p.category.name, _id: p.category._id } : null,
      categoryId: p.categoryId?.toString() || p.category?._id?.toString() || null,
      userId: p.userId && p.userId._id ? {
        _id: p.userId._id.toString(),
        fullname: p.userId.fullname || "N/A",
        email: p.userId.email || "N/A"
      } : null
    }));

    // Check for products with invalid subcategory (subcategory doesn't exist)
    const allProducts = await Product.find({ 
      subCategory: { $ne: null, $exists: true } 
    })
    .select('_id name subCategory')
    .lean();

    const subcategoryIds = [...new Set(
      allProducts.map(p => p.subCategory?.toString()).filter(Boolean)
    )];
    
    const validSubcategories = await SubCategory.find({ 
      _id: { $in: subcategoryIds } 
    })
    .select('_id')
    .lean();

    const validSubcategoryIds = new Set(
      validSubcategories.map(s => s._id.toString())
    );

    const productsWithInvalidSubcategory = allProducts.filter(p => {
      const subCatId = p.subCategory?.toString();
      return subCatId && !validSubcategoryIds.has(subCatId);
    });

    // Group by category
    const byCategory = {};
    productsWithoutSubcategory.forEach(product => {
      const catName = product.category?.name || 'No Category';
      if (!byCategory[catName]) {
        byCategory[catName] = [];
      }
      byCategory[catName].push({
        _id: product._id,
        name: product.name,
        productslug: product.productslug,
        city: product.city,
        state: product.state,
        userId: product.userId,
        createdAt: product.createdAt
      });
    });

    // Group by city
    const byCity = {};
    productsWithoutSubcategory.forEach(product => {
      const city = product.city || 'No City';
      if (!byCity[city]) {
        byCity[city] = [];
      }
      byCity[city].push({
        _id: product._id,
        name: product.name,
        productslug: product.productslug,
        category: product.category?.name,
        userId: product.userId,
        createdAt: product.createdAt
      });
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalWithoutSubcategory: productsWithoutSubcategory.length,
        totalWithInvalidSubcategory: productsWithInvalidSubcategory.length
      },
      productsWithoutSubcategory: productsWithoutSubcategory.map(p => ({
        _id: p._id,
        name: p.name,
        productslug: p.productslug,
        city: p.city,
        state: p.state,
        category: p.category?.name,
        categoryId: p.category?._id?.toString() || p.category?._id || null, // Include category ID
        userId: p.userId,
        createdAt: p.createdAt,
        productUrl: `https://www.dialexportmart.com/products/${p._id}`
      })),
      productsWithInvalidSubcategory: productsWithInvalidSubcategory.map(p => ({
        _id: p._id,
        name: p.name,
        invalidSubCategoryId: p.subCategory
      })),
      groupedByCategory: byCategory,
      groupedByCity: byCity
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error finding products without subcategory:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}
