// app/page.js
import HomeClient from "@/components/home/HomeClient";

export const metadata = {
  title: "Grow with the Best B2B Marketplace in India | Dial Export Mart",
  description:
    "Dial Export Mart empowers exporters, suppliers, manufacturers, and buyers to discover genuine global trade opportunities. Unlock a premium platform to expand your business, connect with verified international buyers, and grow your presence in the worldwide B2B market.",
  keywords:
    "B2B Marketplace India, Export Import India, B2B Suppliers, Indian Exporters, Global Buyers, Dial Export Mart",
  alternates: {
    canonical: "https://www.dialexportmart.com/",
  },
  openGraph: {
    title: "Grow with the Best B2B Marketplace in India | Dial Export Mart",
    description:
      "Dial Export Mart connects exporters, suppliers, and manufacturers with real global buyers. Expand your reach in the worldwide B2B market.",
    url: "https://www.dialexportmart.com",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "/assets/bannerslider/banner-4.png",
        width: 1200,
        height: 630,
        alt: "Dial Export Mart - B2B Marketplace",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};
export default function Home() {
  return <HomeClient />;
}
