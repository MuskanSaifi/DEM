import React from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Dial Export Mart | Trusted Global Export Solutions Provider",
  description:
    "Dial Export Mart is India’s leading B2B marketplace helping exporters, suppliers, and manufacturers connect with verified global buyers.",
  keywords: [
    "about Dial Export Mart",
    "export platform",
    "global trade",
    "business networking",
    "SME support",
    "export services",
  ],
  openGraph: {
    title: "About Dial Export Mart | Trusted Global Export Solutions Provider",
    description:
      "Dial Export Mart is a trusted platform connecting Indian manufacturers and exporters with verified global buyers.",
    url: "https://www.dialexportmart.com/about-us",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/pagesbanner/About-Us.png",
        width: 1200,
        height: 630,
        alt: "About Us Banner",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.dialexportmart.com/about-us",
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
};

const Page = () => {
return (
  <>
    <div className="text-center">
      <Image
        src={"/assets/pagesbanner/About-Us.png"}
        alt="About Us Banner"
        width={1000}
        height={450}
        className="rounded w-full object-cover"
        priority
      />
    </div>

    <div className="container mx-auto p-6">
      <h1 className="title">About <span>Us</span></h1>

      <p className="text-sm text-gray-700 mb-6">
        <strong>Dial Export Mart</strong> is the best B2B marketplace in India{" "}
        <Link href="https://www.dialexportmart.com/" target="_blank" className="text-blue-600 underline">
          (www.dialexportmart.com)
        </Link>{" "}
        and a global trade platform designed to empower small and medium businesses, suppliers, 
        and exporters{" "}
        <Link href="https://www.dialexportmart.com/user/register" target="_blank" className="text-blue-600 underline">
          (Register Here)
        </Link>.
        We bridge the gap between companies and buyers by offering a secure, efficient, and 
        transparent B2B ecosystem for import–export trade.
        With a strong focus on innovation and reliability, Dial Export Mart helps businesses expand 
        globally, gain visibility, and build long-term partnerships.
      </p>

      <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
      <p className="text-sm text-gray-700 mb-6">
        We understand the complexities of the export industry. Our mission is simple — 
        to make exporting easier, faster, and more profitable for Indian exporters. We offer 
        a seamless ecosystem that enables businesses across India to list products, connect 
        with buyers, and secure verified global trade deals.
      </p>

      <h2 className="text-2xl font-bold mb-4">Vision</h2>
      <p className="text-sm text-gray-700 mb-6">
        Our vision is to become India’s most reliable online export marketplace{" "}
        <Link href="https://www.dialexportmart.com/what-we-do" target="_blank" className="text-blue-600 underline">
          (What We Do)
        </Link>,
        helping thousands of businesses go global and build long-term international partnerships.
      </p>

      <h2 className="text-2xl font-bold mb-4">What We Stand for (Our Core Values)</h2>
      <ul className="list-disc list-inside text-sm text-gray-700 mb-6 space-y-1">
        <li>
          <strong>Commitment:</strong> We are fully dedicated to helping exporters grow through 
          real and result-driven global exposure.
        </li>
        <li>
          <strong>Consistency:</strong> We provide on-time support, seamless communication, and 
          reliable service throughout the export journey.
        </li>
        <li>
          <strong>Credibility:</strong> Trust is at the core of everything. Our platform ensures 
          transparency, verified buyers, and secure business exchanges.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Our Team</h2>
      <p className="text-sm text-gray-700 mb-6">
        Behind Dial Export Mart is a passionate team of trade experts, digital strategists, 
        and export consultants dedicated to empowering Indian businesses. We stay ahead of global 
        trade trends to provide:
      </p>

      <ul className="list-disc list-inside text-sm text-gray-700 mb-6 space-y-1">
        <li>Updated insights and market trends</li>
        <li>Authentic and verified buyer connections</li>
        <li>Practical, growth-driven solutions</li>
      </ul>

      <p className="text-sm text-gray-700 mb-6">
        Our collaborative culture fosters innovation, learning, and long-term success for every exporter.
      </p>

      <h2 className="text-2xl font-bold mb-4">How We Work</h2>
      <ol className="list-decimal list-inside text-sm text-gray-700 mb-6 space-y-2">
        <li>
          <strong>Company Analysis:</strong> We analyze your products, market position, and 
          global growth potential.
        </li>
        <li>
          <strong>Strategic Enhancement:</strong> We improve your packaging, branding, and 
          communication for global readiness.
        </li>
        <li>
          <strong>Requirement Documentation:</strong> We document goals, specifications, and 
          target markets for a personalized export strategy.
        </li>
        <li>
          <strong>Buyer Identification:</strong> We match you with verified international buyers 
          relevant to your product category.
        </li>
        <li>
          <strong>Facilitated Communication:</strong> We organize smooth and transparent meetings 
          between buyers and sellers.
        </li>
        <li>
          <strong>Negotiation Assistance:</strong> Our experts help both parties achieve clarity 
          and confidence during negotiations.
        </li>
        <li>
          <strong>Deal Progression:</strong> We ensure seamless movement of the deal with zero 
          operational hurdles.
        </li>
        <li>
          <strong>Deal Closure & Support:</strong> Even after closing the deal, we continue guiding 
          your global expansion journey.
        </li>
      </ol>

      <h2 className="text-2xl font-bold mb-4">What Makes Us Different</h2>
      <p className="text-sm text-gray-700 mb-6">
        As part of We Export Trade Mart, we focus on delivering excellence. Unlike platforms that 
        simply provide buy leads, Dial Export Mart creates genuine, high-quality business connections.
        Our built-in <strong>video conferencing system</strong> allows suppliers to clearly understand 
        buyer needs and build trust from the first interaction.
      </p>

      <p className="text-sm text-gray-700 mb-6">
        We know exporters need real opportunities—not repeated or fake inquiries. This is why 
        Dial Export Mart acts as a true growth partner, connecting exporters with verified buyers 
        for long-term global expansion.
      </p>
    </div>
  </>
);

};

export default Page;
