import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();
    
    // Fetch all distinct cities without filtering by state
    const cities = await Product.distinct("city");

    return Response.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return Response.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
