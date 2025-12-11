// api/adminprofile/sidebarmenu/route.js
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

export async function GET() {
  try {
    await connectDB();

    // 🔥 1. Fetch ALL categories + subcategories (very light query)
    const categories = await Category.find()
      .select("name icon categoryslug subcategories")
      .populate("subcategories", "name icon subcategoryslug products")
      .lean();

    if (!categories.length) {
      return Response.json({ message: "No categories found" }, { status: 404 });
    }

    // 🔥 2. Collect ALL product IDs (flat list)
    const allProductIds = [];
    categories.forEach(cat =>
      cat.subcategories.forEach(sub =>
        sub.products?.forEach(prodId => allProductIds.push(prodId.toString()))
      )
    );

    const uniqueProductIds = [...new Set(allProductIds)];

    // 🔥 3. Fetch ALL products in ONE query
    const products = await Product.find({ _id: { $in: uniqueProductIds } })
      .select("name productslug images userId subCategory")
      .lean();

    const productMap = {};
    products.forEach(p => (productMap[p._id.toString()] = p));

    // 🔥 4. Collect ALL user IDs from products
    const userIds = [
      ...new Set(products.map(p => p.userId?.toString()).filter(Boolean)),
    ];

    // 🔥 5. Fetch ALL Users in ONE query
    const users = await User.find({ _id: { $in: userIds } })
      .select("fullname mobileNumber")
      .lean();

    const userMap = {};
    users.forEach(u => (userMap[u._id.toString()] = u));

    // 🔥 6. Fetch ALL Business Profiles in ONE query
    const profiles = await BusinessProfile.find({ userId: { $in: userIds } })
      .select(
        "userId companyName address city state country gstNumber trustSealVerified yearOfEstablishment"
      )
      .lean();

    const profileMap = {};
    profiles.forEach(p => (profileMap[p.userId.toString()] = p));

    // 🔥 7. Attach Product + User + BusinessProfile to every subcategory
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.products = sub.products
          ?.map(id => {
            const prod = productMap[id.toString()];
            if (!prod) return null;

            return {
              ...prod,
              user: userMap[prod.userId?.toString()] || null,
              businessProfile: profileMap[prod.userId?.toString()] || null,
            };
          })
          .filter(Boolean);
      });
    });

    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error("❌ Optimized Category API Error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
