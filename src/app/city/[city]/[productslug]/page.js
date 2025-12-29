// src/app/city/[city]/[productslug]/page.js
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import User from "@/models/User"; // ✅ Required for populate("userId")
import Category from "@/models/Category"; // ✅ Required for populate("category")
import ProductListClient from "./ProductListClient";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// --- DYNAMIC METADATA GENERATION ---
export async function generateMetadata({ params: rawParams }) {
  try {
    const params = await rawParams;
    const { city, productslug } = params;

    await connectdb();

    // ✅ FIXED: Filter by city AND productslug to use compound index efficiently
    const normalizedCity = city.toLowerCase();
    const product = await Product.findOne({ 
      productslug: productslug.toLowerCase(),
      city: normalizedCity 
    })
      .select("name images")
      .populate("category", "name")
      .lean();

    // --- Formatting Variables ---
    const formattedSlug = productslug.replace(/-/g, " ");
    // City name should be capitalized for display in metadata (e.g., Kolkata)
    const displayCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    
    const productName = product?.name || formattedSlug;

    // --- APPLY NEW FORMULAS ---

    // Title Formula: Best {Category} in {City} - Top Manufacturers, Suppliers & Wholesalers
    const title = `${productName} in ${displayCity} - Best Manufacturers, Suppliers & Wholesalers `;

    // Meta Description Formula: Buy {Category} in {City} at wholesale prices. Connect with verified manufacturers, suppliers and exporters for bulk orders. Fast delivery & quality products.
    const description = `Buy ${productName} in ${displayCity} at wholesale prices. Connect with verified manufacturers, suppliers and exporters for bulk orders. Fast delivery & quality products.`;

    // --- Keywords (Updated to focus on Category/City) ---
    const keywords = [
      productName,
      `${productName} in ${displayCity}`,
      `${productName} suppliers`,
      `${productName} manufacturers`,
      displayCity,
    ];

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `https://www.dialexportmart.com/city/${city}/${productslug}`,
      },
      openGraph: {
        title,
        description,
        images: product?.images?.length
          ? [{ url: product.images[0].url }]
          : [{ url: "/default-product.jpg" }],
        url: `https://www.dialexportmart.com/${city}/${productslug}`,
        type: "article",
        locale: "en_IN",
        siteName: "Dial Export Mart",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product?.images?.length
          ? [{ url: product.images[0].url }]
          : [{ url: "/default-product.jpg" }],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    // Return default metadata on error
    const params = await rawParams;
    const { city, productslug } = params;
    const displayCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    return {
      title: `${productslug.replace(/-/g, " ")} in ${displayCity} - Dial Export Mart`,
      description: `Find ${productslug.replace(/-/g, " ")} in ${displayCity} at wholesale prices.`,
    };
  }
}
// --- END DYNAMIC METADATA GENERATION ---


export default async function Page({ params: rawParams }) {
  try {
    const params = await rawParams;
    const { city, productslug } = params;

    await connectdb();
    
    // ✅ CRITICAL FIX: Use direct city match (lowercase) instead of regex to utilize index
    // ✅ City is stored as lowercase in DB, so normalize input
    const normalizedCity = city.toLowerCase();
    const normalizedSlug = productslug.toLowerCase();
    
    // ✅ FIXED: Add limit to prevent fetching all products (max 100 per page)
    // ✅ FIXED: Use compound index (city_1_productslug_1) efficiently
    // ✅ FIXED: Select only required fields for better performance
    const products = await Product.find({ 
      productslug: normalizedSlug,
      city: normalizedCity // Direct match uses index efficiently
    })
      .select("name price currency images city state minimumOrderQuantity specifications userId productslug")
      .populate("userId", "companyName") // Only fetch companyName, not entire user object
      .limit(100) // ✅ CRITICAL: Limit to prevent CPU spike
      .lean();

    // ✅ FIXED: Serialize products to plain objects for Client Component
    // Next.js requires plain objects (no Mongoose documents, no buffers)
    const serializedProducts = products.map((product) => ({
      ...product,
      _id: product._id?.toString() || product._id,
      userId: product.userId?._id 
        ? { 
            _id: product.userId._id.toString(),
            companyName: product.userId.companyName 
          }
        : product.userId,
      images: product.images?.map((img) => ({
        ...img,
        _id: img._id?.toString() || img._id,
      })) || [],
    }));

    return (
      <ProductListClient
        city={city}
        productslug={productslug}
        initialProducts={serializedProducts}
      />
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty state on error instead of crashing
    return (
      <ProductListClient
        city={city}
        productslug={productslug}
        initialProducts={[]}
      />
    );
  }
}