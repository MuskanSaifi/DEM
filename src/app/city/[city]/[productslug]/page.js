import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductListClient from "./ProductListClient";

// --- DYNAMIC METADATA GENERATION ---
export async function generateMetadata({ params: rawParams }) {
  const params = await rawParams;
  const { city, productslug } = params;

  await connectdb();

  // ✅ UPDATED: Populate 'category' to get the category name for the SEO formula.
  const product = await Product.findOne({ productslug })
    .populate("userId")
    .populate("category") // <-- Added for Category Name
    .lean();

  // --- Formatting Variables ---
  const formattedSlug = productslug.replace(/-/g, " ");
  // City name should be capitalized for display in metadata (e.g., Kolkata)
  const displayCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  

  // --- APPLY NEW FORMULAS ---

  // Title Formula: Best {Category} in {City} - Top Manufacturers, Suppliers & Wholesalers
  const title = `${product?.name} in ${displayCity} - Best Manufacturers, Suppliers & Wholesalers `;

  // Meta Description Formula: Buy {Category} in {City} at wholesale prices. Connect with verified manufacturers, suppliers and exporters for bulk orders. Fast delivery & quality products.
  const description = `Buy ${product?.name} in ${displayCity} at wholesale prices. Connect with verified manufacturers, suppliers and exporters for bulk orders. Fast delivery & quality products.`;

  // --- Keywords (Updated to focus on Category/City) ---
  const keywords = [
    product?.name,
    `${product?.name} in ${displayCity}`,
    `${product?.name} suppliers`,
    `${product?.name} manufacturers`,
    displayCity,
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://www.dialexportmart.com/${city}/${productslug}`,
    },
    openGraph: {
      title,
      description,
      images: product?.images?.length
        ? [{ url: product.images[0].url }]
        : [{ url: "/default-product.jpg" }],
      url: `https://www.dialexportmart.com/${city}/${productslug}`,
      type: "article",
      locale: "en_IN",
      siteName: "Dial Export Mart",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product?.images?.length
        ? [{ url: product.images[0].url }]
        : [{ url: "/default-product.jpg" }],
    },
  };
}
// --- END DYNAMIC METADATA GENERATION ---


export default async function Page({ params: rawParams }) {
  const params = await rawParams;
  const { city, productslug } = params;

  await connectdb();
  // Fetch all products matching the slug in the city
  const products = await Product.find({ 
    productslug,
    // Add city filter here to ensure products are relevant to the URL context
    city: { $regex: `^${city}$`, $options: "i" }
  })
    .populate("userId")
    .lean();

  return (
    <ProductListClient
      city={city}
      productslug={productslug}
      initialProducts={JSON.parse(JSON.stringify(products))}
    />
  );
}