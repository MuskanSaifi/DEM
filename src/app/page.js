// app/page.js
import HomeClient from "@/components/home/HomeClient";
import { organizationSchema, websiteSchema } from "@/lib/schemas";

// JSON-LD: FAQPage (homepage only)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://www.dialexportmart.com/#faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is the best B2B marketplace in India for exporters and suppliers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dial Export Mart is one of the leading marketplaces in India, connecting verified exporters, suppliers, and manufacturers with global buyers.",
      },
    },
    {
      "@type": "Question",
      name: "How does Dial Export Mart help in growing an import-export business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dial Export Mart helps businesses expand globally by offering verified leads, trusted buyers, and easy access to international markets through its B2B platform.",
      },
    },
    {
      "@type": "Question",
      name: "Why should I choose Dial Export Mart over other B2B platforms in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unlike many other platforms, Dial Export Mart focuses on verified connections, transparency, and a user-friendly system designed for small and medium businesses.",
      },
    },
    {
      "@type": "Question",
      name: "Can small businesses use Dial Export Mart to find buyers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, small and medium businesses can easily list products and find genuine B2B buyers in India through Dial Export Mart.",
      },
    },
    {
      "@type": "Question",
      name: "How can I register my business on Dial Export Mart?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To register, visit the Dial Export Mart website, click on \"Become a Member,\" choose your preferred pricing plan, and complete the registration process.",
      },
    },
    {
      "@type": "Question",
      name: "Is Dial Export Mart a free B2B platform in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dial Export Mart offers affordable plans along with free basic listing options to help Indian exporters and manufacturers showcase their products to buyers.",
      },
    },
    {
      "@type": "Question",
      name: "What industries are supported by Dial Export Mart's B2B marketplace?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dial Export Mart supports a wide range of industries including apparel and fashion, electronics, agriculture, chemicals, health and beauty, and more.",
      },
    },
    {
      "@type": "Question",
      name: "Does Dial Export Mart provide international B2B trade support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Dial Export Mart facilitates import-export opportunities with global buyers to help Indian suppliers expand their presence in international B2B markets.",
      },
    },
    {
      "@type": "Question",
      name: "How does Dial Export Mart ensure safe and reliable business deals?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dial Export Mart verifies listings, maintains secure communication channels, and prioritizes credibility and transparency to ensure safe and reliable B2B transactions.",
      },
    },
  ],
};

export const metadata = {
  title: "Best B2B Marketplace in India for Manufacturers & Suppliers",
  description:
    "Dial Export Mart empowers exporters, suppliers, manufacturers, and buyers to discover genuine global trade opportunities. Unlock a premium platform to expand your business, connect with verified international buyers, and grow your presence in the worldwide B2B market.",
  keywords:
    "B2B Marketplace India, Export Import India, B2B Suppliers, Indian Exporters, Global Buyers, Dial Export Mart",
  alternates: {
    canonical: "https://www.dialexportmart.com/",
  },
  openGraph: {
    title: "Best B2B Marketplace in India for Manufacturers & Suppliers ",
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  );
}
