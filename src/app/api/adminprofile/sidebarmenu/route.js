import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate({
        path: "subcategories",
        select: "name icon subcategoryslug products",
        options: { limit: 6 },
      })
      .lean();

    const subList = categories.flatMap((c) => (c.subcategories || []).map((s) => s));
    const subIds = subList.map((s) => s._id);

    if (subIds.length > 0) {
      const productsBySub = await Product.find({
        subCategory: { $in: subIds },
      })
        .select("name productslug subCategory")
        .lean();
      const map = {};
      for (const p of productsBySub) {
        if (!p.subCategory) continue;
        const id = String(p.subCategory);
        if (!map[id]) map[id] = [];
        if (map[id].length < 4) map[id].push({ _id: p._id, name: p.name, productslug: p.productslug });
      }
      // Fallback: subcategories with 0 products but with products[] IDs
      const needFallback = subList.filter((s) => (map[String(s._id)] || []).length === 0 && (s.products?.length || 0) > 0);
      const productIdsFromSub = needFallback.flatMap((s) => s.products || []).filter(Boolean);
      if (productIdsFromSub.length > 0) {
        const byId = await Product.find({ _id: { $in: productIdsFromSub } })
          .select("name productslug")
          .lean();
        for (const sub of needFallback) {
          const ids = (sub.products || []).map((x) => String(x));
          const list = byId.filter((p) => ids.includes(String(p._id))).slice(0, 4);
          map[String(sub._id)] = list.map((p) => ({ _id: p._id, name: p.name, productslug: p.productslug }));
        }
      }
      for (const c of categories) {
        for (const sub of c.subcategories || []) {
          sub.products = map[String(sub._id)] || [];
        }
      }
    }

    return Response.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=432000",
      },
    });
  } catch (err) {
    console.error("Sidebar API Error:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
