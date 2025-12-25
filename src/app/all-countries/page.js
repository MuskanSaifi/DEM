import Image from "next/image";
import Link from "next/link";
import { COUNTRY_META } from "@/lib/countryMeta";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

// ✅ ISR: Revalidate every hour
export const revalidate = 3600;

/* ================================
   SEO METADATA
================================ */
export async function generateMetadata() {
  const title = "Find Suppliers by Country | Global B2B Marketplace";
  const description =
    "Browse verified manufacturers and suppliers by country. Connect with exporters and wholesalers from India, USA, UAE, China, and more global markets.";

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/all-countries`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Dial Export Mart",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ================================
   GET COUNTRIES WITH PRODUCT COUNT
================================ */
async function getCountries() {
  try {
    await connectdb();

    const countriesWithCounts = await Product.aggregate([
      {
        $match: {
          country: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$country" } } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const countries = countriesWithCounts.map((item) => ({
      code: item._id,
      count: item.count,
    }));

    return { success: true, countries };
  } catch (error) {
    console.error("Error fetching countries:", error);
    return { success: false, countries: [] };
  }
}

/* ================================
   PAGE
================================ */
export default async function Countries() {
  const data = await getCountries();

  if (!data?.success) {
    return <p className="text-center py-10">Loading countries...</p>;
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
          Find Suppliers by Country or Region
        </h1>

        <p className="text-gray-600 text-center mt-3">
          {data.countries.length} countries available
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {data.countries.map((country) => {
            const meta = COUNTRY_META[country.code];
            const name = meta?.name || country.code.toUpperCase();

            return (
              <Link
              key={country.code}
              href={`/country/${country.code}`}
              className="
                group
                relative
                flex flex-col items-center
                bg-white
                p-4
                rounded-xl
                border border-gray-100
                shadow-sm
                transition-all duration-300 ease-out
                hover:-translate-y-2
                hover:shadow-xl
                hover:border-blue-300
              "
            >            
            <div className="relative mb-2">
  {meta?.flag ? (
    <div className="
      w-16 h-16
      rounded-full
      overflow-hidden
      border border-gray-200
      transition-all duration-300
      group-hover:scale-110
      group-hover:border-blue-400
      group-hover:shadow-md
    ">
      <Image
        src={meta.flag}
        alt={name}
        width={64}
        height={64}
        className="object-cover"
      />
    </div>
  ) : (
    <div className="
      w-16 h-16
      rounded-full
      bg-gradient-to-br from-blue-100 to-blue-200
      flex items-center justify-center
      text-3xl
      transition-transform duration-300
      group-hover:scale-110
    ">
      🌍
    </div>
  )}
</div>


<span className="
  mt-2
  text-sm
  font-semibold
  text-gray-800
  text-center
  transition-colors duration-300
  group-hover:text-blue-600
">
  {name}
</span>


                <span className="text-xs text-gray-500">
                  {country.count} products
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
