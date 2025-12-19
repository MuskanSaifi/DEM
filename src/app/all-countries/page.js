// /app/all-countries/page.js (or similar)

import Image from "next/image";
import Link from "next/link";
import { COUNTRY_META } from "@/lib/countryMeta";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

// ✅ Dynamic page - fetch at request time (not build time)
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

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
   GET COUNTRIES DIRECTLY FROM DB (NO API CALL)
================================ */
async function getCountries() {
  try {
    await connectdb();
    
    // ✅ Direct database query instead of API call
    const countries = await Product.distinct("country");

    const uniqueCountries = [
      ...new Set(
        countries
          .filter(Boolean)
          .map(c => c.toLowerCase().trim())
      ),
    ];

    return {
      success: true,
      countries: uniqueCountries,
    };
  } catch (error) {
    console.error("Error fetching countries:", error);
    // ✅ Return empty array on error instead of null
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
    <main className="bg-gray-50">
      <section className="container mx-auto px-4 py-12">

        {/* ===== HEADING ===== */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
          Find Suppliers by Country or Region
        </h1>

        <p className="text-gray-600 text-center mt-3 max-w-3xl mx-auto">
          Discover verified manufacturers, exporters, and wholesalers from
          top global markets.
        </p>

        {/* ===== COUNTRY GRID ===== */}
        <div className="
          mt-10
          grid grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-8
          gap-6
          justify-center
        ">
          {data.countries.map((code) => {
            const meta = COUNTRY_META[code];

            return (
              <Link
                key={code}
                href={`/country/${code}`}
                className="
                  flex flex-col items-center
                  space-y-3
                  bg-white
                  p-5
                  rounded-xl
                  shadow-md
                  hover:shadow-lg
                  transition
                "
              >
                {/* Flag */}
                {meta?.flag ? (
                  <Image
                    src={meta.flag} // <-- The correct path comes from here
                    alt={meta.name}
                    width={80}
                    height={80}
                    className="rounded-full border border-gray-300"
                  />
                ) : (
                  <span className="text-4xl">🌍</span>
                )}

                {/* Country Name */}
                <span className="text-sm font-medium text-gray-800 text-center">
                  {meta?.name || code.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </div>

      </section>
    </main>
  );
}