// app/api/category-products/route.js
import connectDB from "@/lib/dbConnect";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Product from "@/models/Product";
import BusinessProfile from "@/models/BusinessProfile";

export async function GET(req) {
  try {
    await connectDB();

    // Read query params: categorySlug, page, limit
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    if (!categorySlug)
      return Response.json({ error: "categorySlug missing" }, { status: 400 });

    // Get category
    const category = await Category.findOne({ categoryslug: categorySlug })
      .select("name categoryslug content subcategories")
      .populate("subcategories", "_id name subcategoryslug");

    if (!category)
      return Response.json({ error: "Category not found" }, { status: 404 });

    // Fetch products for this category using subcategory IDs
  // Fetch products for this category using subcategory IDs
const subCatIds = category.subcategories.map((s) => s._id);

// ⭐ FIXED FIELD NAME (subCategory ✔)
const totalProducts = await Product.countDocuments({
  subCategory: { $in: subCatIds },
});

const products = await Product.find({
  subCategory: { $in: subCatIds },
})
  .select("name description price images tradeShopping minimumOrderQuantity currency userId tags")
  .populate("userId", "fullname mobileNumber")
  .skip(skip)
  .limit(limit)
  .lean();

    // Get all unique user ids
    const userIds = [...new Set(products.map((p) => p.userId?._id?.toString()))];

    const bpList = await BusinessProfile.find({ userId: { $in: userIds } })
      .select("userId companyName city state gstNumber trustSealVerified yearOfEstablishment")
      .lean();

    // Attach business profiles
    const bpMap = {};
    bpList.forEach((bp) => (bpMap[bp.userId] = bp));

    products.forEach((p) => {
      p.businessProfile = bpMap[p.userId?._id] || null;
    });

    return Response.json({
      category,
      products,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
