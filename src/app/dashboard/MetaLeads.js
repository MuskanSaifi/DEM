'use client';

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const PRESET_REMARKS = [
  "Contacted",
  "Don't receive call",
  "Follow up",
  "Interested",
  "Not interested",
  "Wrong number",
  "Callback requested",
  "Qualified",
];

const MetaLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    sortOrder: "desc",
  });

  const [remarkModal, setRemarkModal] = useState({ open: false, leadId: null });
  const [customRemark, setCustomRemark] = useState("");
  const [addingRemark, setAddingRemark] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortOrder: filters.sortOrder,
      });

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/admin/meta-leads?${params}`);
      const result = await response.json();

      if (result.success) {
        setLeads(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handlePageChange = (page) => {
    fetchLeads(page);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      sortOrder: "desc",
    });
  };

  const addRemark = async (leadId, text) => {
    if (!text?.trim()) return;

    setAddingRemark(true);
    try {
      const res = await fetch(`/api/admin/meta-leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: text.trim(), addedBy: "Admin" }),
      });

      const data = await res.json();
      if (data.success) {
        setRemarkModal({ open: false, leadId: null });
        setCustomRemark("");
        await fetchLeads(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error adding remark:", error);
    } finally {
      setAddingRemark(false);
    }
  };

  const downloadLeads = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        exportAll: "true",
        sortOrder: filters.sortOrder,
      });

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/admin/meta-leads?${params}`);
      const result = await response.json();

      if (!result.success || !result.data?.length) {
        alert("No leads found for the selected date range.");
        return;
      }

      const rows = result.data.map((lead) => ({
        Name: lead.fullName || "",
        Mobile: lead.mobileNumber || "",
        "Business Type": lead.businessType || "",
        Company: lead.companyName || "",
        Email: lead.email || "",
        Status: lead.status || "",
        Remarks: (lead.remarks || [])
          .map((r) => `${r.text}${r.addedAt ? ` (${new Date(r.addedAt).toLocaleDateString("en-GB")})` : ""}`)
          .join("; "),
        "Date & Time": lead.createdAt
          ? new Date(lead.createdAt).toLocaleString("en-GB")
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Meta Leads");

      const dateLabel =
        filters.startDate && filters.endDate
          ? `${filters.startDate}_to_${filters.endDate}`
          : filters.startDate
          ? `from_${filters.startDate}`
          : filters.endDate
          ? `until_${filters.endDate}`
          : "all";

      XLSX.writeFile(workbook, `meta_leads_${dateLabel}.xlsx`);
    } catch (error) {
      console.error("Error downloading leads:", error);
      alert("Failed to download leads. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Meta Leads</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={downloadLeads}
                disabled={downloading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? "Downloading..." : "Download Sheet"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{pagination.totalLeads}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {leads.filter((lead) => lead.status === "new").length}
            </div>
            <div className="text-sm text-gray-600">New Leads</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">
              {leads.filter((lead) => lead.status === "contacted").length}
            </div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leads found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.mobileNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {lead.businessType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.companyName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.email || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.status === "new"
                                ? "bg-green-100 text-green-800"
                                : lead.status === "contacted"
                                ? "bg-blue-100 text-blue-800"
                                : lead.status === "qualified"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex flex-col items-center gap-1">
                            {lead.remarks && lead.remarks.length > 0 ? (
                              <ul className="space-y-1 text-xs max-w-[180px]">
                                {lead.remarks.map((r, index) => (
                                  <li
                                    key={index}
                                    className="bg-gray-100 rounded px-2 py-1 text-center"
                                  >
                                    <span className="text-gray-800">{r.text}</span>
                                    {r.addedAt && (
                                      <span className="text-gray-500 ml-1">
                                        {new Date(r.addedAt).toLocaleDateString("en-GB")}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400 text-xs">No remarks</span>
                            )}
                            <button
                              onClick={() => setRemarkModal({ open: true, leadId: lead._id })}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
                            >
                              + Add remark
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.currentPage} of {pagination.totalPages} (
                      {pagination.totalLeads} total leads)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Remark Modal */}
      {remarkModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[420px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-3">Add Remark</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_REMARKS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => addRemark(remarkModal.leadId, r)}
                  disabled={addingRemark}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
                >
                  {r}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Custom remark..."
              value={customRemark}
              onChange={(e) => setCustomRemark(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <button
              onClick={() => addRemark(remarkModal.leadId, customRemark)}
              disabled={addingRemark || !customRemark.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {addingRemark ? "Adding..." : "Submit Custom Remark"}
            </button>

            <button
              onClick={() => {
                setRemarkModal({ open: false, leadId: null });
                setCustomRemark("");
              }}
              className="mt-2 w-full bg-gray-300 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaLeads;
