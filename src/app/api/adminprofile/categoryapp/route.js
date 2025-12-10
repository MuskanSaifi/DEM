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

    // --- Categories fetch with populated subcategories + products ---
    const categories = await Category.find()
      .populate({
        path: "subcategories",
        populate: {
          path: "products",
          match: { userId: { $nin: blockedSellerIds } }, // 👈 blocked sellers ke products hata do
          select:
            "name description price images productslug tradeShopping userId minimumOrderQuantity currency tags",
          populate: [
            {
              path: "userId",
              model: "User",
              select: "fullname mobileNumber",
            },
          ],
        },
      })
      .exec();

    // --- BusinessProfile add karna hai (blocked sellers ke liye null hi rahega) ---
    const categoriesWithBusinessProfiles = await Promise.all(
      categories.map(async (category) => {
        const subcategoriesWithBusinessProfiles = await Promise.all(
          category.subcategories.map(async (subcat) => {
            const productsWithBusinessProfiles = await Promise.all(
              subcat.products.map(async (product) => {
                let businessProfile = null;
                if (product.userId && !blockedSellerIds.includes(product.userId._id.toString())) {
                  businessProfile = await BusinessProfile.findOne({
                    userId: product.userId._id,
                  }).select(
                    "companyName address city state country gstNumber trustSealVerified yearOfEstablishment"
                  );
                }
                return {
                  ...product.toObject(),
                  businessProfile: businessProfile ? businessProfile.toObject() : null,
                };
              })
            );
            return { ...subcat.toObject(), products: productsWithBusinessProfiles };
          })
        );
        return { ...category.toObject(), subcategories: subcategoriesWithBusinessProfiles };
      })
    );

    if (!categoriesWithBusinessProfiles.length) {
      return new Response(JSON.stringify({ message: "No categories found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(categoriesWithBusinessProfiles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch categories" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
