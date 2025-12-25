import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'Terms of Use | Dial Export Mart',
  description:
    'Read Dial Export Mart Terms of Use to understand your rights and responsibilities while using our platform. We ensure transparent and trustworthy guidelines for a safe online experience.',
  keywords: [
    'Terms of Use',
    'Dial Export Mart',
    'Refund Policy',
    'Deals',
    'Export Services',
  ],
  openGraph: {
    title: 'Terms of Use | Dial Export Mart',
    description: 'Detailed Terms of Use policy for clients of Dial Export Mart.',
    url: 'https://www.dialexportmart.com/terms-of-use',
    siteName: 'Dial Export Mart',
    images: [
      {
        url: 'https://www.dialexportmart.com/assets/pagesbanner/tou.png',
        width: 1000,
        height: 450,
        alt: 'Terms of Use Banner',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://www.dialexportmart.com/terms-of-use',
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
        <div className="text-center">
       <Image
  src={"/assets/pagesbanner/tou.png" || "/placeholder.png"}
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
    <h1 className="title">Terms <span>Of Use</span></h1>

    <div className="mt-6 space-y-4 text-gray-700">
      <p>Welcome to <strong>Dial Export Mart</strong>. We are committed to maintaining high standards of interaction with our clients and executing the entire process with their approval. Please read the following terms and conditions carefully:</p>

      <h2 className="font-semibold text-lg mt-4">Payment and Refund Policy:</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>All payments will be accepted through the standard modes set by Dial Export Mart.</li>
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

      <h2 className="font-semibold text-lg mt-6">Confirmed Deals Policy:</h2>
      <p>Welcome to <strong>Dial Export Mart</strong>. We are dedicated to delivering 100% confirmed deals. Just like a well-prepared meal requires the right ingredients, the success of a deal hinges on your active participation and support.</p>

      <h3 className="font-semibold mt-4">Conditions for Confirming Deals:</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Supplier cooperation is crucial. Timely responses and proper follow-ups are necessary for a successful transaction.</li>
        <li>Conference calls with international buyers are not arranged in the buyer connect service. This service is exclusive to domestic clients.</li>
        <li>Payment terms are to be decided and agreed upon by both buyers and sellers. Dial Export Mart does not partake in the negotiation process.</li>
        <li>If a buyer requests a PDC cheque and you agree, Dial Export Mart does not guarantee payment terms. Any payment-related issues must be resolved directly between buyer and seller.</li>
      </ul>

      <h3 className="font-semibold mt-4">Product Availability and Coordination:</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Buyers should allow suppliers time to complete the deal, especially if the products are not readily available.</li>
        <li>Effective coordination between buyer and supplier is essential for a smooth deal closure.</li>
      </ul>

      <h3 className="font-semibold mt-4">Focus and Preferences:</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Our primary focus is connecting suppliers with buyers both in India and internationally.</li>
        <li>Suppliers should allow time for Dial Export Mart to find the right buyers based on specific preferences.</li>
      </ul>

      <h3 className="font-semibold mt-4">Order Placement and Cancellation:</h3>
      <p>Once an order is placed and confirmed, it cannot be canceled, as it promptly moves for further processing.</p>

      <h3 className="font-semibold mt-4">Buyer Connection:</h3>
      <p>Buyer connection work is exclusively handled by <strong>+91-8448668076</strong>. Any buyer connections from other numbers are unauthorized. Please report such cases to <a href="mailto:info@dialexportmart.com" className="text-blue-600 underline">info@dialexportmart.com</a> within 24 hours. Otherwise, Dial Export Mart will not be held responsible.</p>

      <h3 className="font-semibold mt-4">Note:</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Deals can only be closed for companies that have paid 50% of the agreed-upon package amount.</li>
        <li>Dial Export Mart is responsible for payments received only in official company accounts. Payments made to personal accounts are not the responsibility of Dial Export Mart.</li>
      </ul>

      <p className="mt-4">By engaging in our services, you acknowledge and accept these terms and conditions. For any queries or concerns, please contact us at <a href="mailto:info@dialexportmart.com" className="text-blue-600 underline">info@dialexportmart.com</a>.</p>
    </div>
  </div>
</section>


    </>
  )
}

export default page