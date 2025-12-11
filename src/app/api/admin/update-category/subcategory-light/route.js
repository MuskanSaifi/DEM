import connectDB from "@/lib/dbConnect";
import SubCategory from "@/models/SubCategory";

export async function GET() {
  try {
    await connectDB();

    // ⚡ FASTEST QUERY (no populate)
    const subcategories = await SubCategory.find({})
      .select("name _id category")
      .sort({ name: 1 })
      .lean();

    return new Response(JSON.stringify(subcategories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Subcategory-light API Error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to load subcategories" }),
      { status: 500 }
    );
  }
}
