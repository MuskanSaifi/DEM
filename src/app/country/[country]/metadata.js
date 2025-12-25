// app/country/[country]/metadata.js

export async function generateMetadata({ params }) {
  const { country } = await params; // ✅ await params
  const COUNTRY = country.toUpperCase();

  return {
    title: `Exporters & Suppliers in ${COUNTRY} | Dial Export Mart`,
    description: `Find exporters, manufacturers and suppliers in ${COUNTRY}.`,
    alternates: {
      canonical: `https://www.dialexportmart.com/country/${country}`,
    },
  };
}
