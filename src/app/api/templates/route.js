import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const industry = searchParams.get("industry");
  const search = searchParams.get("search");
  const color = searchParams.get("color");

  const query = { isActive: true };

  if (type) query.type = type;
  if (industry) query.industry = industry;
  if (search) query.title = { $regex: search, $options: "i" };
  if (color) query["colors.hex"] = color;

  const templates = await Template.find(query).sort({ createdAt: -1 });

  return Response.json({ templates });
}
