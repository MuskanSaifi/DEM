"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

function formatDisplayDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ImportDataHistory({
  open,
  onClose,
  employees,
  onAssignSuccess,
  refreshKey = 0,
}) {
  const [dates, setDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [assignTo, setAssignTo] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("salesAdminToken")
      : null;

  const fetchDates = useCallback(async () => {
    if (!token) return;
    setDatesLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sales/leads/import-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDates(data.dates || []);
      } else {
        setError(data.message || "Failed to load import dates");
      }
    } catch (err) {
      setError("Failed to load import dates: " + err.message);
    } finally {
      setDatesLoading(false);
    }
  }, [token]);

  const fetchLeadsForDate = useCallback(
    async (date) => {
      if (!token || !date) return;
      setLeadsLoading(true);
      setError("");
      setSelectedLeadIds([]);
      setAssignTo("");
      setEmployeeSearch("");
      try {
        const res = await fetch(
          `/api/sales/leads/import-history?date=${encodeURIComponent(date)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads || []);
        } else {
          setError(data.message || "Failed to load imported leads");
        }
      } catch (err) {
        setError("Failed to load leads: " + err.message);
      } finally {
        setLeadsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (open) {
      setSelectedDate(null);
      setLeads([]);
      setSelectedLeadIds([]);
      setTableSearch("");
      fetchDates();
    }
  }, [open, refreshKey, fetchDates]);

  useEffect(() => {
    if (selectedDate) {
      fetchLeadsForDate(selectedDate);
    }
  }, [selectedDate, fetchLeadsForDate]);

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      (e.fullname || "").toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e._id === assignTo),
    [employees, assignTo]
  );

  const filteredLeads = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        (l.clientName || "").toLowerCase().includes(q) ||
        (l.companyName || "").toLowerCase().includes(q) ||
        (l.mobile || "").includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.state || "").toLowerCase().includes(q)
    );
  }, [leads, tableSearch]);

  const unassignedFiltered = useMemo(
    () => filteredLeads.filter((l) => !l.assignedTo),
    [filteredLeads]
  );

  const handleAssign = async () => {
    if (!assignTo || selectedLeadIds.length === 0) return;
    setAssigning(true);
    setError("");
    try {
      const res = await fetch("/api/sales/admin/assign-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          assignedTo: assignTo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedLeadIds([]);
        setAssignTo("");
        setEmployeeSearch("");
        await fetchLeadsForDate(selectedDate);
        await fetchDates();
        onAssignSuccess?.(data.message);
      } else {
        setError(data.message || "Assignment failed");
      }
    } catch (err) {
      setError("Assignment failed: " + err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
    setLeads([]);
    setSelectedLeadIds([]);
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  setLeads([]);
                  setSelectedLeadIds([]);
                  setTableSearch("");
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                ← Back
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {selectedDate
                ? `Imported Data — ${formatDisplayDate(selectedDate)}`
                : "Imported Data — Select Date"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-3 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {!selectedDate ? (
          <div className="flex-1 overflow-auto p-4">
            {datesLoading ? (
              <p className="text-center text-gray-500 py-12">Loading dates…</p>
            ) : dates.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-3">📋</span>
                <p className="text-gray-600 font-medium">No imported data yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Use &quot;Bulk Import Leads&quot; to import a sheet. Imported
                  data will appear here by date.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dates.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className="text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md transition-all group"
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700">
                      {formatDisplayDate(item.date)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.count} lead{item.count !== 1 ? "s" : ""} imported
                    </p>
                    {item.unassigned > 0 && (
                      <span className="inline-block mt-2 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {item.unassigned} unassigned
                      </span>
                    )}
                    {item.batchCount > 1 && (
                      <span className="inline-block mt-2 ml-1 text-xs text-gray-400">
                        ({item.batchCount} imports)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b bg-gray-50/50 flex flex-wrap items-center gap-3 flex-shrink-0">
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search client, company, mobile…"
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
              />
              <button
                type="button"
                onClick={() =>
                  setSelectedLeadIds(unassignedFiltered.map((l) => l._id))
                }
                disabled={unassignedFiltered.length === 0}
                className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Select All Unassigned ({unassignedFiltered.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedLeadIds([])}
                disabled={selectedLeadIds.length === 0}
                className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Clear Selection
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {leadsLoading ? (
                <p className="text-center text-gray-500 py-12">Loading records…</p>
              ) : filteredLeads.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No records found</p>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredLeads.length > 0 &&
                            selectedLeadIds.length === filteredLeads.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds(filteredLeads.map((l) => l._id));
                            } else {
                              setSelectedLeadIds([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Mobile
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        State
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Assigned To
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead._id}
                        className={`hover:bg-gray-50 ${
                          selectedLeadIds.includes(lead._id) ? "bg-indigo-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds((prev) => [...prev, lead._id]);
                              } else {
                                setSelectedLeadIds((prev) =>
                                  prev.filter((id) => id !== lead._id)
                                );
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
                          {lead.clientName}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {lead.companyName || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {lead.mobile}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {lead.state || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-sm">
                          {lead.assignedTo ? (
                            <span className="text-green-700 font-medium">
                              {lead.assignedTo.fullname}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              Unassigned
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedLeadIds.length > 0 && (
              <div className="px-6 py-4 border-t bg-amber-50 flex flex-wrap items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-amber-900 text-sm">
                  {selectedLeadIds.length} selected
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAssignDropdown((p) => !p)}
                    className="sales-input-focus border-2 border-amber-400 rounded-xl px-4 py-2 bg-white min-w-[200px] font-medium text-sm flex items-center justify-between gap-2"
                  >
                    <span>{selectedEmployee?.fullname || "Select Employee"}</span>
                    <span className="text-xs text-gray-500">▾</span>
                  </button>
                  {showAssignDropdown && (
                    <div className="absolute bottom-12 left-0 w-64 max-h-72 bg-white rounded-xl shadow-2xl border border-amber-300 p-2 z-50">
                      <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        placeholder="Search employee…"
                        className="sales-input-focus w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filteredEmployees.map((emp) => (
                          <button
                            key={emp._id}
                            type="button"
                            onClick={() => {
                              setAssignTo(emp._id);
                              setEmployeeSearch(emp.fullname || "");
                              setShowAssignDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 ${
                              assignTo === emp._id
                                ? "bg-amber-100 font-semibold"
                                : ""
                            }`}
                          >
                            {emp.fullname}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={!assignTo || assigning}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition"
                >
                  {assigning
                    ? "Assigning…"
                    : `Assign ${selectedLeadIds.length} Lead(s)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
