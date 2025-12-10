// src/app/manufacturers/[productslug]/page.js

import ProductDetailClient from "./ProductDetailClient";

// This function runs on the server to generate metadata
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const productslug = resolvedParams?.productslug;

  console.log("✅ generateMetadata called for:", productslug);

  if (!productslug) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for could not be found.",
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/manufacturers/${productslug}`,
      { cache: "no-store" } // Use no-store for dynamic content if product changes frequently
    );

    if (!res.ok) {
      // If the response is not OK, it means the product(s) weren't found
      // Throw an error or return a generic metadata
      console.error(`Failed to fetch product data for metadata: ${res.status}`);
      return {
        title: "Product Not Found",
        description: "Could not load product details for metadata.",
        alternates: {
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/not-found`, // Or a generic products page
        },
      };
    }

    const data = await res.json();
    // 🚩 FIX: Access data.products array and get the first element for metadata
    const product = data.products?.[0]; // Use optional chaining for safety

    // 🚨 IMPORTANT: Check if product is still undefined after attempting to get it
    if (!product) {
      console.warn(`No product found for slug: ${productslug} for metadata generation.`);
      return {
        title: "Product Not Found",
        description: "The product you're looking for could not be found.",
        alternates: {
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/not-found`,
        },
      };
    }

    // Safely destructure with fallback values
    const {
      name,
      // Assuming city, state, country are on the userId (seller) object if populated
      userId,
      specifications = {},
      tradeShopping = {},
      metaTitle,
      metaDescription,
      metaKeywords,
      images, // Get images for Open Graph
    } = product;

    const city = userId?.city;
    const state = userId?.state;
    const country = userId?.country;

    const location = [city, state, country].filter(Boolean).join(", ");
    const brand = tradeShopping.brandName || "";
    const application = specifications.application || specifications.usage || "";
    const feature = specifications.feature || "";
    const material = specifications.material || "";
    const finish = specifications.finish || "";
    const color = specifications.color || "";

    const getOptimizedTitle = () => {
      const baseTitle = name || "Product";
      const locationPart = location ? ` in ${location}` : "";
      const brandPart = brand ? ` by ${brand}` : "";
      return `${baseTitle}${brandPart}${locationPart} - Best Price & Deals`;
    };

    const generateMetaDescription = () => {
      const templates = [
        `${name} is one of the best options available${location ? ` in ${location}` : ""}. Discover its features, specifications, and best pricing here.`,
        `Looking for ${name}? Find premium quality${brand ? ` by ${brand}` : ""}${location ? ` in ${location}` : ""}. Check out its details and prices now.`,
        `Get top deals on ${name}${brand ? ` from ${brand}` : ""}${location ? ` in ${location}` : ""}. Ideal for ${application}. Explore more!`,
        `${name} is known for its ${feature}${material ? ` and durable ${material}` : ""}. Available at the best price online!`,
        `Buy ${name}${brand ? ` by ${brand}` : ""}${location ? ` in ${location}` : ""}. Featuring ${feature}, ${finish} finish, and ${color} color.`,
      ];
      // You might want to use a more sophisticated way to pick a description,
      // or simply use the first one if `metaDescription` is not provided.
      return metaDescription || templates[0];
    };

    const imageUrl = images?.[0]?.url || "/placeholder.png"; // Fallback for Open Graph image

    return {
      title: metaTitle || getOptimizedTitle(),
      description: generateMetaDescription(), // Use the generated description
      keywords: metaKeywords || name?.split(" ")?.join(", ") || "", // Ensure keywords is a string
      openGraph: {
        images: [{ url: imageUrl }],
        title: metaTitle || getOptimizedTitle(),
        description: generateMetaDescription(),
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/manufacturers/${productslug}`,
        type: 'website', // or 'product'
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/manufacturers/${productslug}`,
      },
    };
  } catch (err) {
    console.error("❌ Error generating metadata:", err);
    return {
      title: "Product Not Found",
      description: "The product you're looking for could not be found due to a server error.",
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/not-found`,
      },
    };
  }
}

// ✅ Make the page component async and await params
export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  return <ProductDetailClient productslug={resolvedParams.productslug} />;
}