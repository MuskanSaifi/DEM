import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import BusinessProfile from "@/models/BusinessProfile";
import User from "@/models/User"; // ✅ Required for populate("userId")

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const subcategorySlug = searchParams.get("subcategorySlug");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    if (!categorySlug || !subcategorySlug) {
      return Response.json({ error: "Missing slug params" }, { status: 400 });
    }

    // 1) Find Category
    const category = await Category.findOne({ categoryslug: categorySlug })
      .populate("subcategories")
      .lean();

    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    // 2) Find Subcategory
    const subcat = category.subcategories.find(
      (s) => s.subcategoryslug === subcategorySlug
    );

    if (!subcat) {
      return Response.json({ error: "Subcategory not found" }, { status: 404 });
    }

    // 3) Paginated Products Query
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments({
      subCategory: subcat._id,
    });

    const products = await Product.find({ subCategory: subcat._id })
      .select(
        "name description price images tradeShopping userId minimumOrderQuantity currency tags"
      )
      .populate("userId", "fullname mobileNumber")
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
