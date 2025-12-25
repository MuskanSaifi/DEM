// This file is a Server Component by default
import React from 'react';
import Catalogue from './our-purposal';

export const metadata = {
  title: "Our Digital Services Catalogue | Dial Export Mart",
  description: "Explore our premium digital services catalogue including Website Development, SEO, SMO, and Digital Marketing to grow your business globally.",
  keywords: [
    "digital services catalogue",
    "website development",
    "SEO",
    "social media management",
    "digital marketing",
    "Dial Export Mart",
  ],
  openGraph: {
    title: "Our Digital Services Catalogue | Dial Export Mart",
    description: "Explore our premium digital services catalogue including Website Development, SEO, SMO, and Digital Marketing to grow your business globally.",
    url: "https://www.dialexportmart.com/our-proposal",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/pagesbanner/Proposal.png",
        width: 1200,
        height: 630,
        alt: "Digital Catalogue Banner",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.dialexportmart.com/our-proposal",
  },
  robots: { index: true, follow: true },
  authors: [{ name: "Dial Export Mart", url: "https://www.dialexportmart.com" }],
  publisher: "Dial Export Mart",
  metadataBase: new URL("https://www.dialexportmart.com"), // Add this here if it was present
};

export default function Page() {
  return <Catalogue />;
}