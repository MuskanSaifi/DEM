import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .limit(6)
      .populate({
        path: "subcategories",
        model: "SubCategory",
        select: "name icon subcategoryslug products",
      })
      .lean();

    const subList = categories.flatMap((c) => (c.subcategories || []).map((s) => s));
    const subIds = subList.map((s) => s._id);

    if (subIds.length > 0) {
      // 1) Products by Product.subCategory (main source)
      const bySubCategory = await Product.find({
        subCategory: { $in: subIds },
      })
        .select("name productslug subCategory")
        .lean();

      const map = {};
      for (const p of bySubCategory) {
        if (!p.subCategory) continue;
        const id = String(p.subCategory);
        if (!map[id]) map[id] = [];
        if (map[id].length < 3)
          map[id].push({ _id: p._id, name: p.name, productslug: p.productslug });
      }

      // 2) Fallback: subcategories with 0 products but with products[] IDs (e.g. legacy data)
      const needFallback = subList.filter((s) => (map[String(s._id)] || []).length === 0 && (s.products?.length || 0) > 0);
      const productIdsFromSub = needFallback.flatMap((s) => s.products || []).filter(Boolean);
      if (productIdsFromSub.length > 0) {
        const byId = await Product.find({ _id: { $in: productIdsFromSub } })
          .select("name productslug subCategory")
          .lean();
        for (const sub of needFallback) {
          const ids = (sub.products || []).map((x) => String(x));
          const list = byId.filter((p) => ids.includes(String(p._id))).slice(0, 3);
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
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("HOME CATEGORY API ERROR:", error);
    return Response.json(
      { error: "Failed to load home categories" },
      { status: 500 }
    );
  }
}
