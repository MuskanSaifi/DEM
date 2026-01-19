// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./store/providers";
import LayoutWrapper from "../components/LayoutWrapper";
import "./globals.css";
import "../components/styles/header.css";
import "../components/styles/footer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AppInitializer from "./store/AppInitializer"; // ✅ import added

// JSON-LD: Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.dialexportmart.com/#organization",
  name: "Dial Export Mart",
  url: "https://www.dialexportmart.com/",
  logo: "https://www.dialexportmart.com/assets/logo1234.png",
  description:
    "Dial Export Mart is a leading B2B marketplace in India connecting manufacturers, suppliers, exporters, and buyers worldwide.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+91 8448668076",
    email: "info@dialexportmart.com",
    url: "https://www.dialexportmart.com/contact-us",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://www.facebook.com/dialexportmart",
    "https://www.youtube.com/@DialExportMart",
    "https://www.linkedin.com/company/dialexportmart",
    "https://x.com/DialExportMart",
    "https://www.instagram.com/dialexportmart/",
  ],
};

// JSON-LD: WebSite
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.dialexportmart.com/#website",
  url: "https://www.dialexportmart.com/",
  name: "Dial Export Mart",
  publisher: { "@id": "https://www.dialexportmart.com/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.dialexportmart.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Dial Export Mart | B2B Marketplace in India | B2B Portal in India",
  description:
    "Join Dial Export Mart, India’s premier B2B platform to connect with international buyers and suppliers...",
  keywords:
    "B2B Marketplace in India, B2B Portal, Export Import Marketplace, Indian B2B Platform...",
  alternates: {
    canonical: "https://www.dialexportmart.com/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  authors: [
    {
      name: "Dial Export Mart",
      url: "https://www.dialexportmart.com",
    },
  ],
  publisher: "Dial Export Mart",
  metadataBase: new URL("https://www.dialexportmart.com"),
  openGraph: {
    title: "Dial Export Mart | India’s Leading B2B Marketplace",
    description:
      "Find trusted exporters, suppliers, and global buyers with Dial Export Mart...",
    url: "https://www.dialexportmart.com",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "/assets/bannerslider/banner-4.png",
        width: 1200,
        height: 630,
        alt: "Dial Export Mart - India’s Leading B2B Marketplace",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="R9WyXTgozYVTSKMCjWbQZkact5ZWyCqa9sMQGmKhwnY" />
        <meta name="p:domain_verify" content="d98356c446071847eac6ef2c6611c6cf"/>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
         <AppInitializer> 
            <LayoutWrapper>{children}</LayoutWrapper>
          </AppInitializer>
        </Providers>
      </body>
    </html>
  );
}
