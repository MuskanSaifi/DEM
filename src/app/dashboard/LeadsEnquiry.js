"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaStore } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LeadsEnquiry = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/admin/leadandwnquiry");
        const data = await res.json();
        if (data.success) {
          setLeads(data.data.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // 🔍 Search + Date Filter Logic
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();

    const createdAt = new Date(lead.createdAt);
    const isWithinDateRange =
      (!startDate || createdAt >= new Date(startDate)) &&
      (!endDate || createdAt <= new Date(endDate + "T23:59:59"));

    const matchesSearch =
      lead?.buyer?.fullname?.toLowerCase().includes(term) ||
      lead?.seller?.fullname?.toLowerCase().includes(term) ||
      lead?.buyer?.mobileNumber?.toLowerCase().includes(term) ||
      lead?.seller?.mobileNumber?.toLowerCase().includes(term) ||
      lead?.product?.name?.toLowerCase().includes(term);

    return matchesSearch && isWithinDateRange;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-indigo-600 mb-4 text-center">
        Leads Enquiry
      </h2>

      {/* 🔍 Search + Calendar Filter Bar */}
      <div className="sticky top-0 z-10 mb-6 bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search by buyer, seller, phone, or product..."
          className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* 📅 Date Range Filter */}
        <div className="flex items-center gap-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-sm text-red-500 font-medium hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 🌀 Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4)
            .fill()
            .map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow">
                <Skeleton height={180} />
              </div>
            ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <p className="text-center text-gray-500">No leads found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLeads.map((lead, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {/* Header: Buyer → Product → Seller */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUser className="text-indigo-600" />
                  <div>
                    <p className="font-semibold text-indigo-700 text-sm mb-0">
                      {lead.buyer?.fullname || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mb-0">
                      {lead.buyer?.mobileNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaStore className="text-pink-600" />
                  <div className="text-right">
                    <p className="font-semibold text-pink-700 text-sm mb-0">
                      {lead.seller?.fullname || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {lead.seller?.mobileNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Section */}
              <div className="p-5">
                <div className="flex gap-5 items-start">
                  {/* Product Image */}
                  {lead.product?.images?.[0]?.url ? (
                    <Link href={`/products/${lead.product._id}`} target="_blank">
                      <div className="w-[120px] h-[120px] flex-shrink-0">
                        <Image
                          src={lead.product.images[0].url}
                          alt={lead.product.name}
                          width={120}
                          height={120}
                          className="w-full h-full rounded-xl border object-cover cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md"
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="w-[120px] h-[120px] bg-gray-200 rounded-xl flex-shrink-0" />
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {lead.product?.name || "Unnamed Product"}
                    </h3>
                    {lead.product?.price && (
                      <p className="text-indigo-600 font-bold text-sm">
                        ₹{lead.product.price}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {lead.product?.description || "No description available"}
                    </p>
                  </div>
                </div>

                {/* Lead Info */}
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Quantity:</strong> {lead.quantity} {lead.unit}
                  </p>
                  <p>
                    <strong>Frequency:</strong> {lead.requirementFrequency}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Created:</strong>{" "}
                    {new Date(lead.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedLead(lead);
                    setModalOpen(true);
                  }}
                  className="mt-4 w-full text-center py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔵 Modal for details */}
      {modalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700 text-center">
              Lead Details
            </h3>

            <div className="space-y-3 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="font-semibold text-indigo-700">
                    Buyer Details
                  </p>
                  <p>{selectedLead.buyer?.fullname}</p>
                  <p>{selectedLead.buyer?.mobileNumber}</p>
                  <p>{selectedLead.buyer?.email || "N/A"}</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="font-semibold text-pink-700">Seller Details</p>
                  <p>{selectedLead.seller?.fullname}</p>
                  <p>{selectedLead.seller?.mobileNumber}</p>
                  <p>{selectedLead.seller?.email || "N/A"}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-700 mb-1">
                  Product Details
                </p>
                {selectedLead.product?.images?.[0]?.url && (
                  <Link
                    href={`/products/${selectedLead.product._id}`}
                    target="_blank"
                  >
                    <Image
                      src={selectedLead.product.images[0].url}
                      alt={selectedLead.product.name}
                      width={100}
                      height={100}
                      className="rounded-lg border mb-2 object-cover"
                    />
                  </Link>
                )}
                <p>
                  <strong>Name:</strong> {selectedLead.product?.name}
                </p>
                <p>
                  <strong>Price:</strong> ₹
                  {selectedLead.product?.price || "N/A"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedLead?.product?.description ||
                    "No description available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsEnquiry;
