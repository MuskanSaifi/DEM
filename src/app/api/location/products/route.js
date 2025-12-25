import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state"); // ✅ Fix: Use `state` instead of `city`

  if (!state) {
    return Response.json({ error: "State parameter is required" }, { status: 400 });
  }

  const products = await Product.find({ state }); // ✅ Fetch products by state

  return Response.json({ products });
}
