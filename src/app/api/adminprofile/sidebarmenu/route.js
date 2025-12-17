import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate({
        path: "subcategories",
        select: "name icon subcategoryslug products",
      })
      .lean();

    if (!categories.length) {
      return Response.json([], {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=432000",
        },
      });
    }

    const productIds = new Set();
    categories.forEach((cat) =>
      cat.subcategories.forEach((sub) =>
        sub.products?.slice(0, 6).forEach((id) =>
          productIds.add(id.toString())
        )
      )
    );

    const products = await Product.find({
      _id: { $in: [...productIds] },
    })
      .select("name productslug")
      .lean();

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    categories.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        sub.products = sub.products
          ?.map((id) => productMap[id.toString()])
          .filter(Boolean);
      });
    });

    return Response.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=432000",
      },
    });
  } catch (err) {
    console.error("Sidebar API Error:", err);
    return Response.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}
