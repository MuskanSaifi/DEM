// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./store/providers";
import LayoutWrapper from "../components/LayoutWrapper";
import AnalyticsScripts from "../components/AnalyticsScripts";
import "./globals.css";
import "../components/styles/header.css";
import "../components/styles/footer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AppInitializer from "./store/AppInitializer"; // ✅ import added


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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ GTM Fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PHL73GLL"
            height="0"
            width="0"
            className="hidden invisible"
            title="Google Tag Manager"
          ></iframe>
        </noscript>

        {/* ✅ Meta Pixel Fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            className="hidden"
            src="https://www.facebook.com/tr?id=1743615176583640&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>

        <AnalyticsScripts />
        <Providers>
         <AppInitializer> 
            <LayoutWrapper>{children}</LayoutWrapper>
          </AppInitializer>
        </Providers>
      </body>
    </html>
  );
}
