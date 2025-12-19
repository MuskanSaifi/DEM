import Link from "next/link";
import Image from "next/image";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

/* ================================
   API CALL
================================ */
async function getCountryData(country) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country?country=${country}`,
    { next: { revalidate: 3600 } } // ✅ ISR: Revalidate every hour
  );
  return res.json();
}

/* ================================
   REUSABLE ICON IMAGE (FINAL)
================================ */
function IconImage({ src, alt, size = 32 }) {
  let finalSrc = "/placeholder.png";

  // ✅ If icon is present
  if (src) {
    // Case 1: Cloudinary / full URL
    if (src.startsWith("http")) {
      finalSrc = src;
    }
    // Case 2: local icon key (public/icons)
    else {
      finalSrc = `/icons/${src}`;
    }
  }

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
    </div>
  );
}

/* ================================
   PAGE
================================ */
export default async function CountryPage({ params }) {
  // ✅ Next.js 15 FIX
  const { country } = await params;

  if (!country) {
    return null; // or notFound()
  }

  const data = await getCountryData(country);

  if (!data?.success) return null;

  const grouped = {};
  data.categories.forEach(cat => {
    grouped[cat._id] = { ...cat, subs: [] };
  });

  data.subcategories.forEach(sub => {
    if (grouped[sub.category]) {
      grouped[sub.category].subs.push(sub);
    }
  });
  return (
    <main className="bg-gray-50">

      {/* ================= HERO ================= */}
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">
          Explore The Best Of{" "}
          <span className="text-orange-500 capitalize">
            {country}
          </span>
        </h1>
        <p className="text-gray-600 mt-2">
          Manufacturers & Suppliers from {country.toUpperCase()}
        </p>
      </section>

      {/* ================= SEARCH ================= */}
<section className="bg-white py-12 border-b">
  <div className="container mx-auto px-4 text-center">

    <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
      B2B Marketplace for Exporters in{" "}
      <span className="text-blue-600 capitalize">
        {country}
      </span>
    </h1>

    <p className="text-gray-500 mt-2 text-sm md:text-base">
      Connect with verified suppliers and grow your export business
    </p>

    {/* Search Box */}
    <div className="mt-6 max-w-3xl mx-auto">
      <div className="
        flex items-center
        bg-white
        border border-gray-300
        rounded-full
        overflow-hidden
        focus-within:border-blue-500
        transition
      ">
        <select className="
          px-4 py-3
          text-sm
          text-gray-600
          bg-transparent
          outline-none
          border-r
        ">
          <option>All Categories</option>
        </select>

        <input
          className="
            flex-1
            px-4 py-3
            text-sm
            outline-none
            placeholder-gray-400
          "
          placeholder="Search products or suppliers"
        />

        <button className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          text-sm
          px-6 py-3
          font-medium
          transition
        ">
          Search
        </button>
      </div>
    </div>

  </div>
</section>


{/* ================= TOP CATEGORIES ================= */}
<section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {data.categories.slice(0, 4).map(cat => (
              <Link
                key={cat._id}
                href={`/category/${cat.categoryslug}`}
                className="bg-white rounded-2xl p-8 text-center
                border border-gray-100
                shadow-[0_12px_30px_rgba(0,0,0,0.08)]
                hover:shadow-[0_30px_70px_rgba(59,130,246,0.25)]
                transition-all duration-300 hover:-translate-y-2"
              >
                <div className="h-14 w-14 mx-auto mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <IconImage src={cat.icon} alt={cat.name} size={32} />
                </div>

                <h3 className="font-semibold text-gray-800">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
</section>

{/* ================= CATEGORIES IN COUNTRY ================= */}
   <section className="py-14 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-2xl font-semibold mb-8">
      Categories in {country.toUpperCase()}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.values(grouped).map((cat) => (
        <div
          key={cat._id}
          className="
            bg-white rounded-xl p-5
            border border-gray-200
            hover:border-blue-200
            hover:shadow-sm
            transition
          "
        >
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <IconImage src={cat.icon} alt={cat.name} size={22} />
            </div>

            <Link
              href={`/category/${cat.categoryslug}`}
              className="text-base font-semibold text-gray-800 hover:text-blue-600"
            >
              {cat.name}
            </Link>
          </div>

          {/* Subcategories */}
          <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px]">
            {cat.subs.slice(0, 6).map((sub) => (
              <li key={sub._id}>
                <Link
                  href={`/category/${cat.categoryslug}/${sub.subcategoryslug}`}
                  className="
                    flex items-center gap-2
                    text-gray-600 hover:text-blue-600
                    transition
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* View All */}
          {cat.subs.length > 6 && (
            <Link
              href={`/category/${cat.categoryslug}`}
              className="
                inline-block mt-4
                text-xs font-medium text-blue-600
                hover:underline
              "
            >
              View all →
            </Link>
          )}
        </div>
      ))}
    </div>
  </div>
</section>

{/* ================= SUBCATEGORY TAG LIST ================= */}
<section className="py-10 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-semibold mb-6">
      Browse Products by Category
    </h2>

    <div className="flex flex-wrap gap-2">
      {data.subcategories.map((sub) => (
        <Link
          key={sub._id}
          href={`/category/${sub.category}/${sub.subcategoryslug}`}
          className="
            inline-flex items-center
            px-3 py-1.5
            rounded-full
            bg-gray-100
            text-[10px] font-normal text-gray-700
            border border-gray-200
            hover:bg-blue-50 hover:text-blue-600
            transition
          "
        >
          {sub.name}
        </Link>
      ))}
    </div>
  </div>
</section>


    </main>
  );
}
