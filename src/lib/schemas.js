/**
 * JSON-LD schemas for SEO.
 * Organization: homepage + about-us only.
 * WebSite: homepage only.
 */

export const organizationSchema = {
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

export const websiteSchema = {
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
