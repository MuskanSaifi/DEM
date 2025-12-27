import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

/* ================================
   API CALL
================================ */
async function getCountryProducts(country, page) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country?country=${country}&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ================================
   UTILS – SMART PAGINATION
================================ */
function getPaginationRange(current, total) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  let l;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

/* ================================
   PAGE
================================ */
export default async function CountryPage({ params, searchParams }) {
  const { country } = await params;
  const sp = await searchParams;   // ✅ MUST
  const page = Number(sp?.page || 1);

  const cleanCountry = country?.toLowerCase();
  if (!cleanCountry) return null;

  const data = await getCountryProducts(cleanCountry, page);

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const pages = pagination
    ? getPaginationRange(page, pagination.totalPages)
    : [];

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold capitalize">
          Products from {cleanCountry}
        </h1>
        <p className="text-gray-600 mt-1">
          {pagination?.totalProducts || 0} products available
        </p>
      </section>

      {/* PRODUCTS */}
      <section className="container mx-auto px-4 pb-10">
        {products.length === 0 ? (
          <p className="text-gray-500">No products found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="group bg-white rounded-xl border hover:shadow-lg transition"
              >
                <div className="relative h-40 bg-gray-100 rounded-t-xl overflow-hidden">
                  <Image
                    src={product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="text-sm font-semibold line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-gray-500 capitalize">
                    {product.city}
                  </p>

                  <p className="text-sm font-bold text-blue-600">
                    {product.currency} {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================= PAGINATION ================= */}
      {pagination?.totalPages > 1 && (
        <section className="pb-16">
          {/* DESKTOP */}
<div className="hidden md:flex justify-center items-center gap-2">
  {pages.map((p, index) =>
    p === "..." ? (
      <span
        key={`dots-${index}`}   // ✅ UNIQUE
        className="px-3 text-gray-400"
      >
        …
      </span>
    ) : (
      <Link
        key={`page-${p}-${index}`}  // ✅ UNIQUE
        scroll={false}
        href={`/country/${cleanCountry}?page=${p}`}
        className={`px-4 py-2 rounded-md border text-sm ${
          p === page
            ? "bg-blue-600 text-white"
            : "bg-white hover:bg-gray-100"
        }`}
      >
        {p}
      </Link>
    )
  )}
</div>


          {/* MOBILE */}
          <div className="flex md:hidden justify-center items-center gap-4">
            <Link
              scroll={false}
              href={`/country/${cleanCountry}?page=${Math.max(page - 1, 1)}`}
              className={`px-4 py-2 rounded-md border ${
                page === 1 ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              ← Prev
            </Link>

            <span className="text-sm font-medium">
              Page {page} of {pagination.totalPages}
            </span>

            <Link
              scroll={false}
              href={`/country/${cleanCountry}?page=${Math.min(
                page + 1,
                pagination.totalPages
              )}`}
              className={`px-4 py-2 rounded-md border ${
                page === pagination.totalPages
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              Next →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
