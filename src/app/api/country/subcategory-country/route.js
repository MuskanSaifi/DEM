// api/country/subcategory-country/route.js
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";
import Category from "@/models/Category";

export async function GET(req) {
  await connectdb();

  try {
    const { searchParams } = new URL(req.url);

    const country = searchParams.get("country")?.toLowerCase();
    const categorySlug = searchParams.get("category")?.toLowerCase();
    const subcategorySlug = searchParams.get("subcategory")?.toLowerCase();

    if (!country || !categorySlug || !subcategorySlug) {
      return Response.json({ subcategory: null, products: [] });
    }

    // 🟢 1) Find category by slug (FAST)
    const category = await Category.findOne(
      { categoryslug: categorySlug },
      { name: 1, categoryslug: 1 }
    ).lean();

    if (!category) {
      return Response.json({ subcategory: null, products: [] });
    }

    // 🟢 2) Find subcategory by slug + category
    const subcategory = await SubCategory.findOne(
      {
        subcategoryslug: subcategorySlug,
        category: category._id,
      },
      { name: 1, subcategoryslug: 1, icon: 1 }
    ).lean();

    if (!subcategory) {
      return Response.json({ subcategory: null, products: [] });
    }

    // 🟢 3) Fetch products — ONLY required fields (SUPER FAST)
    const products = await Product.find(
      {
        country,
        category: category._id,
        subCategory: subcategory._id,
      },
      {
        name: 1,
        productslug: 1,
        images: 1, // Only first image needed
      }
    ).lean();

    return Response.json(
      {
        subcategory,
        products,
      },
      { status: 200 }
    );

  } catch (error) {
    console.log(error);
    return Response.json({ message: "Server Error" }, { status: 500 });
  }
}
