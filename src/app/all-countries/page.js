// /app/all-countries/page.js (or similar)

import Image from "next/image";
import Link from "next/link";
import { COUNTRY_META } from "@/lib/countryMeta";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

/* ================================
   SEO METADATA (SERVER SIDE)
================================ */
export async function generateMetadata() {
  const title = "Find Suppliers by Country | Global B2B Marketplace";
  const description =
    "Browse verified manufacturers and suppliers by country. Connect with exporters and wholesalers from India, USA, UAE, China, and more global markets.";

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/all-countries`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Dial Export Mart",
      type: "website",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/og/all-countries.png`,
          width: 1200,
          height: 630,
          alt: "Find Suppliers by Country",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og/all-countries.png`],
    },
  };
}

/* ================================
   GET COUNTRIES WITH PRODUCT COUNTS (OPTIMIZED)
================================ */
async function getCountries() {
  try {
    await connectdb();
    
    // ✅ Get countries with product counts in one query (FAST)
    const countriesWithCounts = await Product.aggregate([
      {
        $match: {
          country: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$country" } } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Sort by product count (most products first)
      }
    ]);

    const countries = countriesWithCounts.map(item => ({
      code: item._id,
      count: item.count
    }));

    return {
      success: true,
      countries,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching countries:", error);
    }
    return {
      success: false,
      countries: [],
    };
  }
}

/* ================================
   PAGE
================================ */
export default async function Countries() {
  const data = await getCountries();
  
  // ✅ Handle error case gracefully
  if (!data?.success || !data?.countries?.length) {
    return (
      <main className="bg-gray-50">
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
            Find Suppliers by Country or Region
          </h1>
          <p className="text-gray-600 text-center mt-3">
            Loading countries...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* ===== HEADING - Mobile Optimized ===== */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Find Suppliers by Country or Region
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 max-w-3xl mx-auto">
            Discover verified manufacturers, exporters, and wholesalers from
            top global markets.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {data.countries.length} countries available
          </p>
        </div>

        {/* ===== COUNTRY GRID - Optimized ===== */}
        <div className="
          grid grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-6
          xl:grid-cols-8
          gap-3 sm:gap-4 md:gap-5 lg:gap-6
          justify-center
        ">
          {data.countries.map((country) => {
            const meta = COUNTRY_META[country.code];
            const countryName = meta?.name || country.code.toUpperCase();

            return (
              <Link
                key={country.code}
                href={`/country/${country.code}`}
                className="
                  group
                  flex flex-col items-center
                  bg-white
                  p-3 sm:p-4 md:p-5
                  rounded-lg sm:rounded-xl
                  shadow-sm
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all duration-300
                  border border-gray-100
                  hover:border-blue-300
                "
              >
                {/* Flag Container */}
                <div className="relative mb-2 sm:mb-3">
                  {meta?.flag ? (
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                      <Image
                        src={meta.flag}
                        alt={countryName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                      <span className="text-2xl sm:text-3xl md:text-4xl">🌍</span>
                    </div>
                  )}
                </div>

                {/* Country Name */}
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {countryName}
                </span>

                {/* Product Count Badge */}
                {country.count > 0 && (
                  <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                    {country.count} {country.count === 1 ? 'product' : 'products'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ===== EMPTY STATE ===== */}
        {data.countries.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm max-w-md mx-auto">
              <span className="text-6xl mb-4 block">🌍</span>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Countries Found
              </h2>
              <p className="text-gray-600 text-sm">
                We're working on adding more countries. Please check back soon!
              </p>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}