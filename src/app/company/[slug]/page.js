// src/app/company/[slug]/page.js

import React from 'react';
import { notFound } from 'next/navigation';

// 🔑 Helper function for masking sensitive data
const maskData = (data) => {
  if (!data || typeof data !== 'string' || data.length < 5) {
    return '—'; // Return default for invalid or short data
  }
  const visibleLength = 4;
  const maskedPart = '*'.repeat(data.length - visibleLength);
  const visiblePart = data.slice(-visibleLength);
  return `${maskedPart}${visiblePart}`; // Example: *****1234
};

export default async function CompanyProfile({ params }) {
  // 1. AWAIT the params object to ensure it is fully resolved
  // This satisfies the Next.js warning/error.
  const resolvedParams = await params; 
  
  // 2. Access the slug from the resolved object
  const slug = resolvedParams?.slug; 

  if (!slug) {
    notFound();
    return null; 
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/userprofile/profile/userprofile/${slug}`, {
    cache: 'no-store',
  });

  const data = await res.json();

  if (!data?.success) {
    notFound();
  }

  const { user, businessProfile } = data;

  // Mask the sensitive fields once here
  const maskedOfficeContact = maskData(businessProfile.officeContact);
  const maskedGstNumber = maskData(businessProfile.gstNumber);
  const maskedAadharNumber = maskData(businessProfile.aadharNumber);
  const maskedPanNumber = maskData(businessProfile.panNumber);

  return (
<section className='mt-5'>
<div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-6 gap-6">
  {/* Left Side - Main Content */}
  <div className="w-full lg:w-3/4">
    {/* Hero Section */}
    <section className="py-4 px-4 bg-indigo-50 flex justify-center">
  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-5xl flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
    
    {/* Left - Avatar/Initial Circle or Image */}
    <div className="flex-shrink-0">
      <div className="w-32 h-32 rounded-lg overflow-hidden bg-indigo-100 flex items-center justify-center text-5xl text-indigo-700 font-bold shadow-inner">
        {user.fullname?.charAt(0).toUpperCase()}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium">

<div className="bg-indigo-50 p-4 rounded-xl shadow-sm">
  <div className="text-gray-600">👤 Partner</div>
  <p className="text-gray-800">{user.fullname || '—'}</p>
</div>

<div className="bg-pink-50 p-4 rounded-xl shadow-sm">
  <div className="text-gray-600">📄 Ownership Type</div>
  <p className="text-gray-800">{businessProfile.ownershipType || '—'}</p>
</div>

{/* MASKED FIELD */}
<div className="bg-green-50 p-4 rounded-xl shadow-sm">
  <div className="text-gray-600">📞 Contact Number</div>
  <p className="text-gray-800">{maskedOfficeContact}</p>
</div>

{/* MASKED FIELD */}
<div className="bg-yellow-50 p-4 rounded-xl shadow-sm">
  <div className="text-gray-600">🧾 GST Number</div>
  <p className="text-gray-800">{maskedGstNumber}</p>
</div>

<div className="bg-blue-50 p-4 rounded-xl shadow-sm sm:col-span-2">
  <div className="text-gray-600">📍 Address</div>
  <p className="text-gray-800">
    {businessProfile?.address
      ? `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state}, ${businessProfile.pincode}, ${businessProfile.country}`
      : '—'}
  </p>
</div>
</div>
  </div>
</section>

<section className="py-5">
    <div className="max-w-4xl space-y-6">
    <div dangerouslySetInnerHTML={{ __html: businessProfile.companyDescription }} />
    </div>
    </section>

    {/* Products Section (No change needed here) */}
    <section className="py-16 bg-white">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Products</h2>
      {user.products && user.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {user.products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-2 text-center border border-gray-200"
            >
              {product.images?.[0]?.url && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-52 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-500 line-clamp-2 mb-0 text-sm">{product.description}</p>
              <div>
                <p className="text-indigo-600 font-bold m-1">₹{product.price}</p>
                <p className="text-sm text-gray-400 mb-1">
                  MOQ: {product.minimumOrderQuantity} {product.moqUnit}
                </p>
<button className=" inline-flex items-center gap-1 m-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300">
  📩 Enquiry Now
</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No products available.</p>
      )}
    </section>

    {/* Business Details */}
    <section className="py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Business Details</h2>
      {businessProfile ? (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
              <tbody>
                {[
                  ['Company Name', businessProfile.companyName],
                  // MASKED FIELD
                  ['Office Contact', maskedOfficeContact],
                  ['Fax Number', businessProfile.faxNumber],
                  ['Ownership Type', businessProfile.ownershipType],
                  ['Annual Turnover', businessProfile.annualTurnover],
                  ['Year of Establishment', businessProfile.yearOfEstablishment],
                  ['No. of Employees', businessProfile.numberOfEmployees],
                  ['Address', businessProfile.address],
                  ['Pincode', businessProfile.pincode],
                  ['City', businessProfile.city],
                  ['State', businessProfile.state],
                  ['Country', businessProfile.country],
                  // MASKED FIELD
                  ['GST Number', maskedGstNumber],
                  // MASKED FIELD
                  ['Aadhar Number', maskedAadharNumber],
                  // MASKED FIELD
                  ['PAN Number', maskedPanNumber],
                  ['IEC Number', businessProfile.iecNumber],
                  ['TAN Number', businessProfile.tanNumber],
                  ['VAT Number', businessProfile.vatNumber],
                ].map(([label, value], index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4 font-semibold w-1/3">{label}</td>
                    <td className="p-4">{value || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-12 text-center">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <p className="text-indigo-600 text-xl font-bold">
                {businessProfile.businessType?.join(', ')}
              </p>
              <p className="text-gray-500 text-sm mt-1">Business Type</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <p className="text-indigo-600 text-xl font-bold">{businessProfile.numberOfEmployees}</p>
              <p className="text-gray-500 text-sm mt-1">Employees</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <p className="text-indigo-600 text-xl font-bold">{businessProfile.yearOfEstablishment}</p>
              <p className="text-gray-500 text-sm mt-1">Est. Year</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <p className="text-indigo-600 text-xl font-bold">{businessProfile.annualTurnover}</p>
              <p className="text-gray-500 text-sm mt-1">Turnover</p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No business profile available.</p>
      )}
    </section>


    {/* CTA Section (No change needed here) */}
    <section className="py-16 bg-indigo-600 text-white text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold">Interested in Our Products?</h2>
        <p className="text-lg">Contact us via WhatsApp or email to place your order or ask questions.</p>
        {user.mobile && (
          <a
            href={`https://wa.me/${user.mobile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full shadow hover:bg-indigo-50 transition"
          >
            Chat on WhatsApp
          </a>
        )}
      </div>
    </section>
  </div>

  {/* Right Side - Fixed Seller Details (No change needed here) */}
<div className="w-full lg:w-1/4 mt-10 lg:mt-0">
  <div className="lg:sticky lg:top-6">
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Seller Details</h3>

      {/* Partner/Owner Name */}
      <p className="font-medium text-gray-700 m-1">👤 Name</p>
      <p className="mb-3">{user?.fullname || '—'}</p>

      {/* Member Since */}
      <p className="font-medium text-gray-700 mb-1">📅 Member Since</p>
      <p className="mb-3">
        {businessProfile?.yearOfEstablishment
          ? `${new Date().getFullYear() - businessProfile.yearOfEstablishment} Years`
          : '—'}
      </p>

      {/* Address */}
      <p className="font-medium text-gray-700 mb-1">📍 Address</p>
      <p className="mb-3">
        {businessProfile?.address
          ? `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state}, ${businessProfile.pincode}, ${businessProfile.country}`
          : '—'}
      </p>

      {/* Link */}
      <a
        href={`https://www.google.com/search?q=Exporters in ${businessProfile?.city || 'India'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline text-sm block mb-4"
      >
        Exporters in {businessProfile?.city || 'your area'}
      </a>

      {/* View Catalog */}
      <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition mb-3">
        🌐 View Catalog
      </button>

      {/* Send Enquiry Button */}
      <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
        ✉️ Send Enquiry
      </button>
    </div>
  </div>
</div>
</div>
</section>
  );
}