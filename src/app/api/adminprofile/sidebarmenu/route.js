

import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

// ✅ CACHE SETTINGS (VERY IMPORTANT)
export const dynamic = "force-static";
export const revalidate = 432000; // 5 days


export async function GET() {
  try {
    await connectDB();

    // 1️⃣ Categories + Subcategories (ONLY REQUIRED FIELDS)
    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate({
        path: "subcategories",
        select: "name icon subcategoryslug products",
      })
      .lean();

    if (!categories.length) {
      return Response.json([], { status: 200 });
    }

    // 2️⃣ Collect product IDs (LIMITED USE)
    const productIds = new Set();
    categories.forEach(cat =>
      cat.subcategories.forEach(sub =>
        sub.products?.slice(0, 6).forEach(id => productIds.add(id.toString()))
      )
    );

    // 3️⃣ Fetch ONLY product name + slug
    const products = await Product.find({ _id: { $in: [...productIds] } })
      .select("name productslug")
      .lean();

    const productMap = {};
    products.forEach(p => (productMap[p._id.toString()] = p));

    // 4️⃣ Attach products to subcategories (LIGHT)
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.products = sub.products
          ?.map(id => productMap[id.toString()])
          .filter(Boolean);
      });
    });

    return Response.json(categories, { status: 200 });
  } catch (err) {
    console.error("Sidebar API Error:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
