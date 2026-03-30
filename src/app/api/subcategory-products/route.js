import connectDB from "@/lib/dbConnect";
import mongoose from "mongoose";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import BusinessProfile from "@/models/BusinessProfile";
import User from "@/models/User"; // ✅ Required for populate("userId")
import Certificate from "@/models/Certificate";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const subcategorySlug = searchParams.get("subcategorySlug");
    const subcategoryId = searchParams.get("subcategoryId");
    const city = searchParams.get("city")?.toLowerCase();
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    if (!subcategorySlug && !subcategoryId) {
      return Response.json({ error: "subcategorySlug or subcategoryId required" }, { status: 400 });
    }

    let subcat;
    let category;

    if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId)) {
      const subcatDoc = await SubCategory.findById(subcategoryId)
        .populate("category", "name categoryslug icon")
        .lean();
      if (subcatDoc) {
        subcat = subcatDoc;
        category = subcat?.category || null;
      }
    }

    if (!subcat && categorySlug && subcategorySlug) {
      // Existing flow: categorySlug + subcategorySlug
      category = await Category.findOne({ categoryslug: categorySlug })
        .populate("subcategories")
        .lean();
      if (!category) {
        return Response.json({ error: "Category not found" }, { status: 404 });
      }
      subcat = category.subcategories.find(
        (s) => (s.subcategoryslug || "").toLowerCase() === (subcategorySlug || "").toLowerCase()
      );
    }

    if (!subcat && subcategorySlug && subcategorySlug !== "NO SLUG") {
      // City flow: subcategorySlug + city - find SubCategory directly (case-insensitive)
      const safeSlug = (subcategorySlug || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const subcatDoc = await SubCategory.findOne({
        subcategoryslug: { $regex: new RegExp(`^${safeSlug}$`, "i") },
      })
        .populate("category", "name categoryslug icon")
        .lean();
      subcat = subcatDoc;
      category = subcat?.category || null;
    }

    if (!subcat) {
      return Response.json({ error: "Subcategory not found" }, { status: 404 });
    }

    // 3) Paginated Products Query - add city filter when provided
    const skip = (page - 1) * limit;
    const productQuery = { subCategory: subcat._id };
    if (city) {
      productQuery.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    const totalProducts = await Product.countDocuments(productQuery);

    const products = await Product.find(productQuery)
      .select(
        "name description price images tradeShopping userId minimumOrderQuantity currency tags city state"
      )
      .populate("userId", "fullname mobileNumber companyName userProfileSlug")
      .skip(skip)
      .limit(limit)
      .lean();

    // 4) Fetch business profile for these products
    const userIds = [...new Set(products.map((p) => p.userId?._id?.toString()))];

    const profiles = await BusinessProfile.find({ userId: { $in: userIds } })
      .select(
        "userId companyName address city state country gstNumber trustSealVerified yearOfEstablishment"
      )
      .lean();

    const profileMap = {};
    profiles.forEach((bp) => (profileMap[bp.userId.toString()] = bp));

    products.forEach((p) => {
      const uid = p.userId?._id?.toString();
      p.businessProfile = profileMap[uid] || null;
    });

    // 5) Certified badge info for sellers in this list
    const activeCerts = await Certificate.find({
      userId: { $in: userIds },
      status: "active",
    })
      .select("userId")
      .lean();
    const certifiedUserIds = new Set(activeCerts.map((c) => String(c.userId)));
    products.forEach((p) => {
      const uid = p.userId?._id?.toString();
      p.isCertified = !!(uid && certifiedUserIds.has(uid));
    });

    return Response.json({
      category,
      subcategory: subcat,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      page,
    });
  } catch (err) {
    console.error("Subcategory API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
