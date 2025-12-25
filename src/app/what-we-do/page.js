import WhatWeDo from "./WhatWeDo";

export const metadata = {
  title: "What We Do | DialExportMart | Global Export Solutions & Trade Services",
  description: "Connecting Indian suppliers with global buyers through verified deals and expert trade support",
  keywords: ["What We Do", "Dial Export Mart Services", "Export Platform", "Import Export India", "Global Trade", "Business Network"],
  alternates: {
    canonical: "https://www.dialexportmart.com/what-we-do",
  },
  openGraph: {
    title: "What We Do | DialExportMart | Global Export Solutions & Trade Services",
    description: "Explore how Dial Export Mart supports exporters, importers, and businesses by providing a powerful trading platform.",
    url: "https://www.dialexportmart.com/what-we-do",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/what-we-do.png", // Update this image if needed
        width: 1200,
        height: 630,
        alt: "What We Do at Dial Export Mart",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What We Do | DialExportMart | Global Export Solutions & Trade Services",
    description: "Learn how Dial Export Mart helps businesses grow through seamless global trade solutions.",
    images: ["https://www.dialexportmart.com/assets/what-we-do.png"], // Update if necessary
  },
};

export default function Page() {
  return <WhatWeDo />;
}
