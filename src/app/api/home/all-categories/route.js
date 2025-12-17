import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .lean();

    if (!categories.length) {
      return Response.json([], { status: 200 });
    }

    const subIds = categories.flatMap(c => c.subcategories).map(String);

    const subcategories = await SubCategory.find({ _id: { $in: subIds } })
      .select("name icon subcategoryslug products")
      .lean();

    const subMap = Object.fromEntries(
      subcategories.map(s => [s._id.toString(), s])
    );

    const productIds = [
      ...new Set(subcategories.flatMap(s => s.products || []).map(String))
    ];

    const products = await Product.find({ _id: { $in: productIds } })
      .select("name productslug images userId")
      .lean();

    const productMap = Object.fromEntries(
      products.map(p => [p._id.toString(), p])
    );

    const userIds = [...new Set(products.map(p => p.userId?.toString()))];

    const users = await User.find({ _id: { $in: userIds } })
      .select("fullname mobileNumber")
      .lean();

    const userMap = Object.fromEntries(
      users.map(u => [u._id.toString(), u])
    );

    const profiles = await BusinessProfile.find({ userId: { $in: userIds } })
      .select("userId companyName city state country trustSealVerified")
      .lean();

    const profileMap = Object.fromEntries(
      profiles.map(p => [p.userId.toString(), p])
    );

    const finalCategories = categories.map(cat => ({
      ...cat,
      subcategories: cat.subcategories
        .map(id => subMap[id.toString()])
        .filter(Boolean)
        .map(sub => ({
          ...sub,
          products: (sub.products || [])
            .map(pid => {
              const p = productMap[pid.toString()];
              if (!p) return null;
              return {
                ...p,
                user: userMap[p.userId?.toString()] || null,
                businessProfile: profileMap[p.userId?.toString()] || null,
              };
            })
            .filter(Boolean),
        })),
    }));

    return Response.json(finalCategories, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
