"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaStore } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PRESET_REMARKS = ["Follow up", "Called", "Emailed", "Resolved", "Closed", "Spam", "Not interested"];

const LeadsEnquiry = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarkModal, setRemarkModal] = useState({ open: false, leadId: null });
  const [customRemark, setCustomRemark] = useState("");
  const [addingRemark, setAddingRemark] = useState(false);
  const customRemarkInputRef = useRef(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leadandwnquiry");
      const data = await res.json();
      if (data.success) {
        setLeads((data.data || []).reverse());
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const addRemark = async (leadId, text) => {
    if (!text?.trim()) return;
    setAddingRemark(true);
    try {
      const res = await fetch(`/api/admin/leadandwnquiry/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: text.trim(), addedBy: "Admin" }),
      });
      const data = await res.json();
      if (data.success) {
        setRemarkModal({ open: false, leadId: null });
        setCustomRemark("");
        await fetchLeads();
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead((prev) => (prev ? { ...prev, remarks: [...(prev.remarks || []), { text: text.trim(), addedBy: "Admin", addedAt: new Date() }] } : null));
        }
      }
    } catch (err) {
      console.error("Error adding remark:", err);
    } finally {
      setAddingRemark(false);
    }
  };

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

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={120} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={60} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={70} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={100} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={90} /></th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill().map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={24} /></td>
                  <td className="px-4 py-3"><Skeleton height={32} width={100} /></td>
                  <td className="px-4 py-3"><Skeleton height={40} width={90} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredLeads.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No leads found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredLeads.map((lead, i) => (
                  <tr key={lead._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{lead.buyer?.fullname || "N/A"}</p>
                          <p className="text-xs text-gray-500">{lead.buyer?.mobileNumber || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaStore className="text-pink-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{lead.seller?.fullname || "N/A"}</p>
                          <p className="text-xs text-gray-500">{lead.seller?.mobileNumber || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {lead.product?.images?.[0]?.url ? (
                          <Link href={`/products/${lead.product._id}`} target="_blank" className="flex-shrink-0">
                            <Image
                              src={lead.product.images[0].url}
                              alt={lead.product?.name || ""}
                              width={48}
                              height={48}
                              className="rounded-lg border object-cover"
                            />
                          </Link>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">{lead.product?.name || "—"}</p>
                          {lead.product?.price != null && (
                            <p className="text-xs text-indigo-600">₹{lead.product.price}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {lead.quantity} {lead.unit || ""}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {lead.requirementFrequency || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
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
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="px-4 py-3" style={{ minWidth: 180 }}>
                      <div className="flex flex-col gap-1">
                        {(lead.remarks && lead.remarks.length > 0) ? (
                          <ul className="list-none space-y-1 text-xs">
                            {lead.remarks.map((r, idx) => (
                              <li key={idx} className="bg-gray-100 rounded px-2 py-1">
                                <span className="text-gray-800">{r.text}</span>
                                {r.addedAt && (
                                  <span className="text-gray-500 ml-1">
                                    {new Date(r.addedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400 text-xs">No remarks</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setRemarkModal({ open: true, leadId: lead._id });
                            setCustomRemark("");
                          }}
                          className="text-left text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1"
                        >
                          + Add remark
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

              {selectedLead.remarks && selectedLead.remarks.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="font-semibold text-amber-800 mb-2">Remarks</p>
                  <ul className="space-y-1 text-sm">
                    {selectedLead.remarks.map((r, idx) => (
                      <li key={idx} className="flex justify-between gap-2">
                        <span>{r.text}</span>
                        <span className="text-gray-500 text-xs">
                          {r.addedAt ? new Date(r.addedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Remark Modal */}
      {remarkModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[95%] max-w-md">
            <h4 className="text-lg font-bold text-indigo-700 mb-4">Add Remark</h4>
            <p className="text-sm text-gray-600 mb-2">Preset (click to add):</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_REMARKS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addRemark(remarkModal.leadId, preset)}
                  disabled={addingRemark}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-indigo-50 disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => customRemarkInputRef.current?.focus()}
                disabled={addingRemark}
                className="px-3 py-1.5 rounded-lg border-2 border-indigo-400 bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100 disabled:opacity-50 font-medium"
              >
                Custom
              </button>
            </div>
            <hr className="my-4" />
            <p className="text-sm text-gray-600 mb-2">Custom remark (type below):</p>
            <div className="flex gap-2">
              <input
                ref={customRemarkInputRef}
                type="text"
                placeholder="Type custom remark..."
                value={customRemark}
                onChange={(e) => setCustomRemark(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRemark(remarkModal.leadId, customRemark)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => addRemark(remarkModal.leadId, customRemark)}
                disabled={addingRemark || !customRemark.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {addingRemark ? "..." : "Add"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setRemarkModal({ open: false, leadId: null }); setCustomRemark(""); }}
              className="mt-4 w-full py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsEnquiry;
