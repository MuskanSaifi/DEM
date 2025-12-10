import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  const cities = await Product.distinct("city", { state });

  return Response.json({ cities });
}
