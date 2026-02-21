"use client";

import React, { useState, useEffect } from "react";

/**
 * Common popup modal to search client details (User, Buyer, SalesLead).
 * Uses normalized keys (name, email, phone, businessName, product, status, paymentStatus)
 * so full details + payment status show correctly from any model.
 */
const ClientFilterModal = ({ isOpen, onClose, onApply }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLookupResult(null);
      setName("");
      setEmail("");
      setPhone("");
      setBusinessName("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    const ph = phone.trim();
    const biz = businessName.trim();
    if (!n && !em && !ph && !biz) {
      setLookupResult({ error: "Please enter at least one field (name, email, phone, or business name)." });
      return;
    }

    setLookupLoading(true);
    setLookupResult(null);
    try {
      const params = new URLSearchParams();
      if (n) params.set("name", n);
      if (em) params.set("email", em);
      if (ph) params.set("phone", ph);
      if (biz) params.set("businessName", biz);
      const res = await fetch(`/api/client-filter-lookup?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLookupResult({
          users: data.users,
          buyers: data.buyers,
          salesLeads: data.salesLeads,
        });
      } else {
        setLookupResult({ error: data.message || "Search failed." });
      }
      if (onApply) {
        onApply({
          name: n,
          email: em,
          phone: ph,
          businessName: biz,
          paymentStatus: "",
        });
      }
    } catch (err) {
      setLookupResult({ error: "Search failed. Please try again." });
    } finally {
      setLookupLoading(false);
    }
  };

  if (!isOpen) return null;

  /** Render one row with all normalized fields (same keys for User, Buyer, SalesLead) */
  const renderRow = (row, idx) => {
    const hasAny = row.name || row.email || row.phone || row.businessName || row.product || row.status;
    if (!hasAny && !row.paymentStatus) return null;
    return (
      <li key={idx} className="py-3 px-4 rounded-lg bg-white border border-gray-200 space-y-1.5 text-sm">
        {row.name && <div><span className="font-medium text-gray-500">Name:</span> {row.name}</div>}
        {row.email && <div><span className="font-medium text-gray-500">Email:</span> {row.email}</div>}
        {row.phone && <div><span className="font-medium text-gray-500">Phone:</span> {row.phone}</div>}
        {row.businessName && <div><span className="font-medium text-gray-500">Business:</span> {row.businessName}</div>}
        {row.product && <div><span className="font-medium text-gray-500">Product:</span> {row.product}</div>}
        {row.status && <div><span className="font-medium text-gray-500">Status:</span> {row.status}</div>}
        <div className="pt-1">
          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${row.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {row.paymentStatus === "paid" ? "Paid" : "Unpaid"}
          </span>
        </div>
      </li>
    );
  };

  const renderSection = (label, data) => {
    if (!data || !data.list) {
      return (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
          <p className="text-sm text-gray-500 pl-1">No record found</p>
        </div>
      );
    }
    if (data.list.length === 0) {
      return (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
          <p className="text-sm text-gray-500 pl-1">No record found</p>
        </div>
      );
    }
    return (
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {label} — {data.total} record(s) · <span className="text-green-600">Paid: {data.paid}</span>, <span className="text-amber-600">Unpaid: {data.unpaid}</span>
        </p>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {data.list.map((row, idx) => renderRow(row, idx))}
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-800">
            Filter Client Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Filter by name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Filter by email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Filter by phone number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Filter by business / company name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {lookupResult && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Result — Full details &amp; payment status
              </p>
              {lookupResult.error ? (
                <p className="text-sm text-red-600">{lookupResult.error}</p>
              ) : (
                <>
                  {renderSection("User (Seller)", lookupResult.users)}
                  {renderSection("Buyer", lookupResult.buyers)}
                  {renderSection("Sales Lead", lookupResult.salesLeads)}
                </>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={lookupLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 px-5 rounded-lg transition"
            >
              {lookupLoading ? "Searching…" : "Search"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFilterModal;
