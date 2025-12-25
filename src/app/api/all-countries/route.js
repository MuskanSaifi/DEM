// src/app/api/all-countries/route.js
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET() {
  await connectdb();

  try {
    const countries = await Product.distinct("country");

    const uniqueCountries = [
      ...new Set(
        countries
          .filter(Boolean)
          .map(c => c.toLowerCase().trim())
      ),
    ];

    return Response.json(
      {
        success: true,
        countries: uniqueCountries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ALL COUNTRIES API ERROR:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
