import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const productslug = searchParams.get("productslug");

    const query = {};

    // ✅ City filter
    if (city && city !== "all") {
      query.city = city.toLowerCase();
    }

    // ✅ Product filter only if NOT "all"
    if (productslug && productslug !== "all") {
      query.productslug = productslug.toLowerCase();
    }

    const products = await Product.find(query)
      .select("name price images city userId")
      .populate("userId", "companyName")
      .limit(200)
      .lean();

    return Response.json({ products });
  } catch (err) {
    console.error(err);
    return Response.json({ products: [] }, { status: 500 });
  }
}
