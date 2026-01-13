import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

/**
 * Debug API: Check what subcategories are found for a city
 * Usage: GET /api/debug/city-subcategories?city=ahmedabad
 */
export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.toLowerCase();

    if (!city) {
      return NextResponse.json(
        { error: "City parameter required" },
        { status: 400 }
      );
    }

    // Find products with case-insensitive city match
    const products = await Product.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      subCategory: { $ne: null }
    })
      .select("name city subCategory category")
      .populate("category", "name categoryslug")
      .populate("subCategory", "name subcategoryslug")
      .limit(100)
      .lean();

    // Group by subcategory
    const subcategoriesMap = {};
    const productsBySubcat = {};

    products.forEach((p) => {
      const subcatId = p.subCategory?._id?.toString();
      const subcatName = p.subCategory?.name;
      const subcatSlug = p.subCategory?.subcategoryslug;
      const catName = p.category?.name;

      if (subcatId && subcatName) {
        if (!subcategoriesMap[subcatId]) {
          subcategoriesMap[subcatId] = {
            id: subcatId,
            name: subcatName,
            slug: subcatSlug || "NO SLUG",
            category: catName,
            count: 0,
            products: []
          };
          productsBySubcat[subcatId] = [];
        }
        subcategoriesMap[subcatId].count++;
        productsBySubcat[subcatId].push({
          name: p.name,
          city: p.city
        });
      }
    });

    return NextResponse.json({
      city: city,
      totalProducts: products.length,
      subcategories: Object.values(subcategoriesMap),
      productsBySubcategory: productsBySubcat,
      rawProducts: products.slice(0, 10) // First 10 for debugging
    }, { status: 200 });

  } catch (error) {
    console.error("Debug API Error:", error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
