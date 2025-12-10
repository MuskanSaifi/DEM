import ContactPage from "./ContactPage";

export const metadata = {
  title: "Contact Dial Export Mart | Export Solutions & Support | Get in Touch Today",
  description: "Connect with Dial Export Mart for support, business inquiries, and B2B assistance. Reach us for live help and seamless global trade support.",
  keywords: ["Contact Dial Export Mart", "Customer Support", "Business Inquiry", "Export Help", "Import Assistance", "Partnerships"],
  alternates: {
    canonical: "https://www.dialexportmart.com/contact-us",
  },
  robots: {
  index: true,
  follow: true,
},
  openGraph: {
    title: "Contact Dial Export Mart | Export Solutions & Support | Get in Touch Today",
    description: "Connect with Dial Export Mart for support, business inquiries, and B2B assistance. Reach us for live help and seamless global trade support.",
    url: "https://www.dialexportmart.com/contact-us",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/pagesbanner/Contact Us.png",
        width: 1200,
        height: 630,
        alt: "Contact Us Banner",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ContactPage />;
}
  