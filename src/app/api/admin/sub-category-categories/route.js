import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    // LIGHTWEIGHT: Only data needed for dropdown
    const categories = await Category.find({})
      .select("name categoryslug icon createdAt")
      .sort({ name: 1 })
      .lean();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Categories Lite API Error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      { status: 500 }
    );
  }
}
