// api/adminprofile/categoryapp/route.js
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import BlockedUser from "@/models/BlockedUser";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId"); // 👈 current userId (frontend se bhejna hoga)

    // --- Blocked sellers nikal lo
    let blockedSellerIds = [];
    if (userId) {
      const blockedSellers = await BlockedUser.find({ blockedBy: userId }).select("sellerId");
      blockedSellerIds = blockedSellers.map((b) => b.sellerId.toString());
    }

    // ✅ OPTIMIZED: Fetch categories with LIMITED products per subcategory
    const categories = await Category.find()
      .populate({
        path: "subcategories",
        populate: {
          path: "products",
          match: { userId: { $nin: blockedSellerIds } },
          select:
            "name description price images productslug tradeShopping userId minimumOrderQuantity currency tags",
          options: { limit: 10 }, // ✅ Limit products per subcategory to prevent CPU spike
          populate: [
            {
              path: "userId",
              model: "User",
              select: "fullname mobileNumber",
            },
          ],
        },
      })
      .lean(); // ✅ Use lean() for better performance

    // ✅ OPTIMIZED: Collect all userIds first, then fetch all BusinessProfiles in ONE query
    const userIdSet = new Set();
    categories.forEach((category) => {
      category.subcategories?.forEach((subcat) => {
        subcat.products?.forEach((product) => {
          const uid = product.userId?._id?.toString() || product.userId?.toString();
          if (uid && !blockedSellerIds.includes(uid)) {
            userIdSet.add(uid);
          }
        });
      });
    });

    const userIds = [...userIdSet];
    
    // ✅ Fetch ALL BusinessProfiles in ONE query instead of individual queries
    const businessProfiles = await BusinessProfile.find({
      userId: { $in: userIds },
    })
      .select("userId companyName address city state country gstNumber trustSealVerified yearOfEstablishment")
      .lean();

    // ✅ Create map for O(1) lookup
    const bpMap = {};
    businessProfiles.forEach((bp) => {
      bpMap[bp.userId.toString()] = bp;
    });

    // ✅ Attach business profiles in memory (no extra DB calls)
    categories.forEach((category) => {
      category.subcategories?.forEach((subcat) => {
        subcat.products?.forEach((product) => {
          const uid = product.userId?._id?.toString() || product.userId?.toString();
          product.businessProfile = uid && !blockedSellerIds.includes(uid) ? bpMap[uid] || null : null;
        });
      });
    });

    const categoriesWithBusinessProfiles = categories;

    if (!categoriesWithBusinessProfiles.length) {
      return new Response(JSON.stringify({ message: "No categories found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(categoriesWithBusinessProfiles), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // ✅ Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch categories" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
