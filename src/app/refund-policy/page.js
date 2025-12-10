import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: "Refund Policy | Dial Export Mart",
  description:
    "Learn about Dial Export Mart refund and return policy that puts your convenience and satisfaction first.",
  keywords: [
    "Refund Policy",
    "Dial Export Mart",
    "Membership Cancellation",
    "Service Liability",
    "No Refund Terms",
    "Payment Terms"
  ],
  openGraph: {
    title: "Refund Policy | Dial Export Mart",
    description:
      "Understand our refund and cancellation policy for memberships and services. Read before making payments.",
    url: "https://www.dialexportmart.com/refund-policy", // ✅ Replace `yourdomain.com`
    type: "website",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "/assets/pagesbanner/Refund Policy.png", // ✅ Avoid space in filename
        width: 1200,
        height: 630,
        alt: "Refund Policy Banner"
      }
    ]
  },
  alternates: {
    canonical: "https://www.dialexportmart.com/refund-policy", // ✅ Replace `yourdomain.com`
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  authors: [ // ✅ You had this outside metadata (move it inside)
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
        <div className="text-center">
   <Image
  src={"/assets/pagesbanner/Refund Policy.png" || "/placeholder.png"}
  alt="Blog Banner"
  layout="responsive"
  width={1000}
  height={450}
  className="rounded-md object-cover w-full"
  priority
/>

        </div>


        <section>
  <div className="container mx-auto p-6">
    <h1 className="title">Refund <span>Policy</span></h1>
    <div className="mt-6 space-y-4 text-gray-700">
      <p>Welcome to <strong>Dial Export Mart</strong>. We are committed to maintaining high standards of interaction with our clients and executing the entire process with their approval. Please read the following terms and conditions carefully:</p>

      <h2 className="font-semibold text-lg mt-4">Payment and Refund Policy:</h2>
      <ul className="list-disc pl-6 space-y-2">
      <li>All payments will be accepted through the standard modes set by Dial Export Mart.</li>
      <li>If the company provides you with SEO services for your website along with the website development, we will deduct the cost of the respective services from the total package amount.</li>
      <li>Due to the interactive nature of our services and the client's involvement in the process, there is no provision for any full or partial refunds. The paid amount will not be refunded under any circumstances.</li>
      <li>Once an order is placed, it cannot be canceled, as it is sent for processing immediately. Personal preferences changing over time are not valid reasons for a refund or chargeback.</li>
      <li>We keep records of each payment and activated service. All services and payment records are forwarded to clients on their letterhead, which must be signed by the user or customer with their company stamp or attached PAN card. Dial Export Mart will not be responsible for any refund unless major concerns are raised with complete proof.</li>
    </ul>

      <h2 className="font-semibold text-lg mt-4">Liability and Refund Assurance:</h2>
      <p>Dial Export Mart holds the liability that, even if a customer declares non-receipt of services, no refund will be processed unless the client provides proof of not receiving services despite regular communication and emails from our team.</p>
      <p>All payments for services at <a href="https://digitalexportsmarketing.com" className="text-blue-600 underline">digitalexportsmarketing.com</a> must be made in favor of "<strong>Dial Export Mart</strong>".</p>

      <h2 className="font-semibold text-lg mt-4">Employee Departure and Refund:</h2>
      <p>If an employee leaves Dial Export Mart and provides negative feedback for services already paid for, and your membership has completed one month, we are not liable for any refund.</p>

      <h2 className="font-semibold text-lg mt-4">Membership and Refund Scenarios:</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>If you paid for membership and after one month decide not to continue services because your company closes, we can transfer your payment to another company or reference, but no refund will be issued.</li>
        <li>Deals promised in a membership package are counted within the tenure period. If a deal does not close in one month, Dial Export Mart has the entire membership tenure to close all deals. No refund will be processed based on the commitment of one deal per month.</li>
     <li>We request full cooperation from our clients to ensure smooth and effective service delivery throughout the year. If you choose to discontinue your association with the company during the service year, no refund will be applicable.
</li>
<li>DEM retains the full duration of the membership to deliver the services as outlined in your selected package.</li>
      </ul>

      <h2 className="font-semibold text-lg mt-4">Cancellation and Refund Claim:</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Before membership activation, users can claim a refund via:</li>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Credit Card:</strong> Email your cancellation request to the billing email sent by us.</li>
          <li><strong>Cheque/Demand Draft:</strong> We will return the instrument if the request is made before it's deposited.</li>
          <li><strong>Foreign Wire Transfer:</strong> Initiate a "Recall" via your bank before service activation.</li>
        </ul>
      </ul>

      <h2 className="font-semibold text-lg mt-4">Legal Disputes and Jurisdiction:</h2>
      <p>Any legal dispute related to Dial Export Mart will be handled in the jurisdiction of Delhi, specifically in the courts located in New Delhi.</p>

      <h2 className="font-semibold text-lg mt-4">Community Disputes Policy:</h2>
      <p>Dial Export Mart is not responsible for disputes between community members, users, or visitors. Issues related to classifieds, website content, or information must be addressed to the respective member directly.</p>

      <p className="mt-4">We hope this information helps you use the services of <strong>Dial Export Mart</strong> responsibly and wisely. Our team is always here to assist you with the best possible solutions.</p>
    </div>
  </div>
</section>
    </>
  )
}

export default page