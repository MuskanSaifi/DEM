"use client";

import React from "react";
import Buyfrom from "@/app/products/[id]/Buyfrom";

export default function CompanySidebar({ user, businessProfile }) {
  const firstProduct = user?.products?.[0];
  const sellerId = user?._id;

  return (
    <div className="w-full lg:w-1/4 mt-10 lg:mt-0">
      <div className="lg:sticky lg:top-6">
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Seller Details</h3>

          <p className="font-medium text-gray-700 m-1">👤 Name</p>
          <p className="mb-3">{user?.fullname || "—"}</p>

          <p className="font-medium text-gray-700 mb-1">📅 Member Since</p>
          <p className="mb-3">
            {businessProfile?.yearOfEstablishment
              ? `${new Date().getFullYear() - businessProfile.yearOfEstablishment} Years`
              : "—"}
          </p>

          <p className="font-medium text-gray-700 mb-1">📍 Address</p>
          <p className="mb-3">
            {businessProfile?.address
              ? `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state}, ${businessProfile.pincode}, ${businessProfile.country}`
              : "—"}
          </p>

          <a
            href={`https://www.google.com/search?q=Exporters in ${businessProfile?.city || "India"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline text-sm block mb-4"
          >
            Exporters in {businessProfile?.city || "your area"}
          </a>

          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition mb-3">
            🌐 View Catalog
          </button>

          {firstProduct && sellerId ? (
            <Buyfrom
              product={firstProduct}
              sellerId={sellerId}
              buttonLabel="Send Enquiry"
              buttonClassName="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            />
          ) : (
            <button className="w-full bg-gray-400 text-white py-2 rounded-lg font-semibold cursor-not-allowed" disabled>
              ✉️ Send Enquiry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
