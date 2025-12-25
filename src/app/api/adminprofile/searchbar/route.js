// api/adminprofile/searchbar/route.js
import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose"; //


// GET method - Fetch all products
export async function GET(req) {
  try {
    await connectDB();

    // Get the URL and parse for query parameters
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("search");

    let query = {};

    // 1. Add Search Filtering
    if (searchTerm) {
      // Use $regex for case-insensitive partial matching on the 'name' field
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const products = await Product.find(query)
      // 2. Select ONLY the necessary fields for suggestions
      .select("name productslug")
      // 3. Limit the results for faster response
      .limit(20) // Get top 20 matches for suggestions
      // 4. Sort by name for better user experience
      .sort({ name: 1 })
      // 5. REMOVE .populate() - it's not needed for search suggestions
      .exec();

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products" }),
      { status: 500 }
    );
  }
}