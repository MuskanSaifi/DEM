// C:\Users\abc\Desktop\DEM\src\app\products\[id]\page.js
import ProductDetailPage from "./ProductPage";

// ✅ ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Dynamic metadata generation
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    // ✅ Fixed: Use environment variable instead of hardcoded localhost
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const res = await fetch(`${apiUrl}/api/products/${id}`, {
      next: { revalidate: 3600 }, // ✅ ISR: Revalidate every hour
    });
    const product = await res.json();

    return {
      title: `${product?.name || "Product"} | Dial Export Mart`,
      description: product?.description?.slice(0, 160) || "Explore high-quality products on Dial Export Mart.",
      keywords: [
        product?.name,
        product?.userId?.companyName,
        "Export",
        "Import",
        "B2B Marketplace",
      ].filter(Boolean),
      alternates: {
        canonical: `https://www.dialexportmart.com/products/${id}`,
      },
      openGraph: {
        title: `${product?.name || "Product"} | Dial Export Mart`,
        description: product?.description?.slice(0, 160) || "Explore products on Dial Export Mart.",
        url: `https://www.dialexportmart.com/products/${id}`,
        siteName: "Dial Export Mart",
        images: [
          {
            url: product?.images?.[0] || "https://www.dialexportmart.com/assets/product-default.png",
            width: 1200,
            height: 630,
            alt: product?.name || "Product Image",
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: "Product | Dial Export Mart",
      description: "Explore quality products at Dial Export Mart.",
    };
  }
}

export default function Page() {
  return <ProductDetailPage />;
}
