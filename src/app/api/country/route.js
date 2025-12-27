import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req) {
  await connectdb();

  try {
    const { searchParams } = new URL(req.url);

    const countryParam = searchParams.get("country");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 28;

    if (!countryParam) {
      return Response.json(
        { success: false, message: "Country missing" },
        { status: 400 }
      );
    }

    const country = countryParam.toLowerCase().trim();
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(
        { country },
        {
          name: 1,
          productslug: 1,
          price: 1,
          currency: 1,
          images: 1,
          city: 1,
        }
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments({ country }),
    ]);

    return Response.json({
      success: true,
      products,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
      },
    });

  } catch (err) {
    console.error("COUNTRY PRODUCTS API ERROR:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
