"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PRESET_REMARKS = ["Follow up", "Called", "Emailed", "Resolved", "Closed", "Spam", "Not interested"];

const AllContacts = ({ supportMember }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [remarkModal, setRemarkModal] = useState({ open: false, contactId: null });
  const [customRemark, setCustomRemark] = useState("");
  const [addingRemark, setAddingRemark] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("/api/contact");
      const list = response.data.contacts || [];
      const reversed = [...list].reverse();
      setContacts(reversed);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addRemark = async (contactId, text) => {
    if (!text?.trim()) return;
    setAddingRemark(true);
    try {
      const res = await axios.patch(`/api/contact/${contactId}`, {
        remark: text.trim(),
        addedBy: "Support",
      });
      if (res.data?.success) {
        setRemarkModal({ open: false, contactId: null });
        setCustomRemark("");
        await fetchContacts();
      }
    } catch (err) {
      console.error("Error adding remark:", err);
    } finally {
      setAddingRemark(false);
    }
  };

  const openRemarkModal = (contactId) => {
    setRemarkModal({ open: true, contactId });
    setCustomRemark("");
  };
  const closeRemarkModal = () => setRemarkModal({ open: false, contactId: null });

  useEffect(() => {
    let filtered = contacts;

    if (searchName) {
      filtered = filtered.filter((contact) =>
        contact.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchEmail) {
      filtered = filtered.filter((contact) =>
        contact.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    if (searchPhone) {
      filtered = filtered.filter((contact) =>
        (contact.phone || "").toLowerCase().includes(searchPhone.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter((contact) => {
        const contactDate = new Date(contact.createdAt).toISOString().split("T")[0];
        return contactDate === filterDate;
      });
    }

    setFilteredContacts(filtered);
  }, [searchName, searchEmail, searchPhone, filterDate, contacts]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  if (!supportMember?.allContactAccess) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-red-600 font-semibold mt-5">
        Admin has not given you access to this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">📞 All Contacts</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4).fill().map((_, i) => (
            <Skeleton key={i} height={40} />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left"><Skeleton width={60} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={120} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={100} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={80} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={120} /></th>
                <th className="px-4 py-3 text-left"><Skeleton width={100} /></th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill().map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3"><Skeleton height={20} /></td>
                  <td className="px-4 py-3"><Skeleton height={20} /></td>
                  <td className="px-4 py-3"><Skeleton height={20} /></td>
                  <td className="px-4 py-3"><Skeleton height={20} /></td>
                  <td className="px-4 py-3"><Skeleton height={20} /></td>
                  <td className="px-4 py-3"><Skeleton height={32} width={90} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">📞 All Contacts</h1>

      {/* Filters - same as dashboard */}
      <div className="sticky top-0 z-10 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row flex-wrap gap-4">
        <input
          type="text"
          className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="email"
          className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <input
          type="text"
          className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Search by phone"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <input
          type="date"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Table - same columns as dashboard */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white">
              <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
Contact Details
</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
<td className="px-4 py-3">
  <div className="flex flex-col">
    <span className="font-semibold text-gray-900">{contact.name}</span>
    <span className="text-sm text-gray-600">{contact.email}</span>
    <span className="text-sm text-gray-600">{contact.phone || "—"}</span>
  </div>
</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[280px] break-words">{contact.description || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDate(contact.createdAt)}</td>
                    <td className="px-4 py-3" style={{ minWidth: 200 }}>
                      <div className="flex flex-col gap-1">
                        {(contact.remarks && contact.remarks.length > 0) ? (
                          <ul className="list-none space-y-1 text-xs">
                            {contact.remarks.map((r, i) => (
                              <li key={i} className="bg-gray-100 rounded px-2 py-1">
                                <span className="text-gray-800">{r.text}</span>
                                {r.addedAt && (
                                  <span className="text-gray-500 ml-1">
                                    {formatDate(r.addedAt)}
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
                          onClick={() => openRemarkModal(contact._id)}
                          className="text-left text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1"
                        >
                          + Add remark
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Remark Modal - same as dashboard */}
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
                  onClick={() => addRemark(remarkModal.contactId, preset)}
                  disabled={addingRemark}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-indigo-50 disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
            <hr className="my-4" />
            <p className="text-sm text-gray-600 mb-2">Custom remark:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type custom remark..."
                value={customRemark}
                onChange={(e) => setCustomRemark(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRemark(remarkModal.contactId, customRemark)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => addRemark(remarkModal.contactId, customRemark)}
                disabled={addingRemark || !customRemark.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {addingRemark ? "..." : "Add"}
              </button>
            </div>
            <button
              type="button"
              onClick={closeRemarkModal}
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

export default AllContacts;
