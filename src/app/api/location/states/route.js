import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("countryCode");

  const users = await User.find({ mobileNumber: new RegExp(`^${countryCode}`) }, "state");
  const products = await Product.find({}, "state");

  const states = [...new Set([...users.map(u => u.state), ...products.map(p => p.state)])];

  return Response.json({ states });
}
