


import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";


export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    await connectDB();

    // 1️⃣ Fetch all categories (very lightweight)
    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .lean();

    if (!categories.length) {
      return Response.json({ message: "No categories found" }, { status: 404 });
    }

    // Collect subcategory IDs
    const subIds = categories
      .flatMap((c) => c.subcategories)
      .map((id) => id.toString());

    // 2️⃣ Fetch subcategories (only essential fields)
    const subcategories = await SubCategory.find({ _id: { $in: subIds } })
      .select("name icon subcategoryslug products")
      .lean();

    const subMap = {};
    subcategories.forEach((s) => {
      subMap[s._id.toString()] = s;
    });

    // Collect product IDs
    const productIds = subcategories
      .flatMap((s) => s.products || [])
      .map((id) => id.toString());

    const uniqueProductIds = [...new Set(productIds)];

    // 3️⃣ Fetch products (fast fields only)
    const products = await Product.find({ _id: { $in: uniqueProductIds } })
      .select("name productslug images userId")
      .lean();

    const productMap = {};
    products.forEach((p) => (productMap[p._id.toString()] = p));

    // Collect all userIds
    const userIds = [...new Set(products.map((p) => p.userId?.toString()))];

    // 4️⃣ Fetch users once
    const users = await User.find({ _id: { $in: userIds } })
      .select("fullname mobileNumber")
      .lean();

    const userMap = {};
    users.forEach((u) => (userMap[u._id.toString()] = u));

    // 5️⃣ Fetch business profiles once
    const profiles = await BusinessProfile.find({ userId: { $in: userIds } })
      .select(
        "userId companyName address city state country gstNumber trustSealVerified yearOfEstablishment"
      )
      .lean();

    const profileMap = {};
    profiles.forEach((bp) => (profileMap[bp.userId.toString()] = bp));

    // 6️⃣ Combine everything (very fast assembly)
    const finalCategories = categories.map((category) => {
      return {
        ...category,
        subcategories: category.subcategories.map((sid) => {
          const sub = subMap[sid.toString()];
          if (!sub) return null;

          const populatedProducts = (sub.products || []).map((pid) => {
            const p = productMap[pid.toString()];
            if (!p) return null;

            return {
              ...p,
              user: userMap[p.userId?.toString()] || null,
              businessProfile: profileMap[p.userId?.toString()] || null,
            };
          });

          return {
            ...sub,
            products: populatedProducts.filter(Boolean),
          };
        }),
      };
    });

    return Response.json(finalCategories, { status: 200 });
  } catch (err) {
    console.error("❌ API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
