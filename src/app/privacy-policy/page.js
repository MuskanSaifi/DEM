import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: "Privacy Policy - Dial Export Mart",
  description:
    "Read the privacy policy of Dial Export Mart to understand how we collect, use, and protect your personal information in compliance with data regulations.",
  keywords: [
    "privacy policy",
    "Dial Export Mart privacy",
    "data protection",
    "personal information",
    "user data",
    "business data security"
  ],
  openGraph: {
    title: "Privacy Policy - Dial Export Mart",
    description:
      "Read the privacy policy of Dial Export Mart to understand how we collect, use, and protect your personal information in compliance with data regulations.",
    url: "https://www.dialexportmart.com/privacy-policy",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/pagesbanner/Privacy%20Policy.png",
        width: 1200,
        height: 630,
        alt: "Privacy Policy Banner",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.dialexportmart.com/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  authors: [
    {
      name: 'Dial Export Mart',
      url: 'https://www.dialexportmart.com',
    },
  ],
  publisher: 'Dial Export Mart',
  metadataBase: new URL('https://www.dialexportmart.com'),
};


const page = () => {
  return (
    <>
          <div>
           <Image
  src={"/assets/pagesbanner/Privacy Policy.png" || "/placeholder.png"}
  alt="Blog Banner"
  layout="responsive"
  width={1000}
  height={450}
  className="rounded-md object-cover w-full"
  priority
/>

            </div>
    <section>
        <div className='container mx-auto p-6'>
      <h1 className="title">Privacy <span>Policy</span></h1>
      <p>
        At <strong>Dial Export Mart</strong>, we are committed to safeguarding your privacy. This privacy policy outlines how we collect, use, share, and store your personal data.
      </p>

      <h2>Controller of Your Data</h2>
      <p>
        <strong>Dial Export Mart</strong> is the controller of any personal data you provide. If you have questions, you can contact us at 
        <a href="mailto:digitalexports878@gmail.com"> digitalexports878@gmail.com</a>.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect basic business-related personal information such as:</p>
      <ul>
        <li>Name</li>
        <li>Business address</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Company name</li>
        <li>Job title</li>
      </ul>
      <p>
        This information may be collected through our website, direct communication, industry events, or public data sources. 
        We also use Google Analytics to understand how users interact with our site. 
        This includes traffic sources, site behavior, and technical information (like browser type or OS)—not personally identifiable.
      </p>

      <h2>Legitimate Interest & Data Usage</h2>
      <p>
        We process some data under the legal basis of <strong>legitimate interest</strong> to provide relevant information about our services. 
        We ensure this processing does not override your rights. We may contact you through:
      </p>
      <ul>
        <li>Email</li>
        <li>Phone</li>
        <li>Post</li>
      </ul>
      <p>Visit our Contact page for more about how we communicate.</p>

      <h2>Other Uses of Your Data</h2>
      <p>Your data may also be used for the following:</p>
      <ul>
        <li>Completing contracted services</li>
        <li>Responding to website inquiries</li>
        <li>Enabling website features</li>
        <li>Improving and maintaining our website</li>
        <li>Complying with legal obligations or court orders</li>
      </ul>

      <h2>Payment Responsibility</h2>
      <p>
        <strong>Dial Export Mart</strong> is responsible only for payments received into official company accounts. 
        We are not liable for payments made to individual or unauthorized accounts.
      </p>
    </div>
    </section>
    </>
  );
};

export default page;
