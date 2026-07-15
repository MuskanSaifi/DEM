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

function SourceBadge({ source }) {
  if (source === "bulk_import") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        Sheet Import
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
      Single
    </span>
  );
}

export default function ImportDataHistory({
  open,
  onClose,
  employees,
  onAssignSuccess,
  refreshKey = 0,
}) {
  const [employeeImports, setEmployeeImports] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);
  const [dates, setDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [assignTo, setAssignTo] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [listEmployeeSearch, setListEmployeeSearch] = useState("");
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("salesAdminToken")
      : null;

  const fetchEmployeeImports = useCallback(async () => {
    if (!token) return;
    setEmployeesLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sales/leads/import-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEmployeeImports(data.employees || []);
      } else {
        setError(data.message || "Failed to load employee import data");
      }
    } catch (err) {
      setError("Failed to load employee import data: " + err.message);
    } finally {
      setEmployeesLoading(false);
    }
  }, [token]);

  const fetchDatesForEmployee = useCallback(
    async (employeeId) => {
      if (!token || !employeeId) return;
      setDatesLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/sales/leads/import-history?employeeId=${encodeURIComponent(employeeId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setDates(data.dates || []);
          setSelectedEmployeeInfo(data.employee || null);
        } else {
          setError(data.message || "Failed to load import dates");
        }
      } catch (err) {
        setError("Failed to load import dates: " + err.message);
      } finally {
        setDatesLoading(false);
      }
    },
    [token]
  );

  const fetchLeadsForEmployeeDate = useCallback(
    async (employeeId, date) => {
      if (!token || !employeeId || !date) return;
      setLeadsLoading(true);
      setError("");
      setSelectedLeadIds([]);
      setAssignTo("");
      setEmployeeSearch("");
      try {
        const res = await fetch(
          `/api/sales/leads/import-history?employeeId=${encodeURIComponent(employeeId)}&date=${encodeURIComponent(date)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads || []);
          if (data.employee) setSelectedEmployeeInfo(data.employee);
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
      setSelectedEmployee(null);
      setSelectedEmployeeInfo(null);
      setSelectedDate(null);
      setDates([]);
      setLeads([]);
      setSelectedLeadIds([]);
      setListEmployeeSearch("");
      setTableSearch("");
      fetchEmployeeImports();
    }
  }, [open, refreshKey, fetchEmployeeImports]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchDatesForEmployee(selectedEmployee);
    }
  }, [selectedEmployee, fetchDatesForEmployee]);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      fetchLeadsForEmployeeDate(selectedEmployee, selectedDate);
    }
  }, [selectedEmployee, selectedDate, fetchLeadsForEmployeeDate]);

  const filteredEmployeesForAssign = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      (e.fullname || "").toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const selectedAssignEmployee = useMemo(
    () => employees.find((e) => e._id === assignTo),
    [employees, assignTo]
  );

  const filteredEmployeeImports = useMemo(() => {
    const q = listEmployeeSearch.trim().toLowerCase();
    if (!q) return employeeImports;
    return employeeImports.filter(
      (e) =>
        (e.fullname || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q)
    );
  }, [employeeImports, listEmployeeSearch]);

  const filteredLeads = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        (l.clientName || "").toLowerCase().includes(q) ||
        (l.companyName || "").toLowerCase().includes(q) ||
        (l.mobile || "").includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.state || "").toLowerCase().includes(q) ||
        (l.product || "").toLowerCase().includes(q)
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
        await fetchLeadsForEmployeeDate(selectedEmployee, selectedDate);
        await fetchDatesForEmployee(selectedEmployee);
        await fetchEmployeeImports();
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
    setSelectedEmployee(null);
    setSelectedEmployeeInfo(null);
    setSelectedDate(null);
    setDates([]);
    setLeads([]);
    setSelectedLeadIds([]);
    setError("");
    onClose();
  };

  const employeeName = selectedEmployeeInfo?.fullname || "Employee";

  const modalTitle = selectedDate
    ? `Fresh New Import Data — ${employeeName} — ${formatDisplayDate(selectedDate)}`
    : selectedEmployee
      ? `Fresh New Import Data — ${employeeName} — Select Date`
      : "Fresh New Import Data — Select Employee";

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            {(selectedEmployee || selectedDate) && (
              <button
                type="button"
                onClick={() => {
                  if (selectedDate) {
                    setSelectedDate(null);
                    setLeads([]);
                    setSelectedLeadIds([]);
                    setTableSearch("");
                  } else {
                    setSelectedEmployee(null);
                    setSelectedEmployeeInfo(null);
                    setDates([]);
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                ← Back
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
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

        {!selectedEmployee ? (
          <div className="flex-1 overflow-auto p-4 flex flex-col">
            <div className="mb-4 px-2">
              <input
                type="text"
                value={listEmployeeSearch}
                onChange={(e) => setListEmployeeSearch(e.target.value)}
                placeholder="Search employee by name or email…"
                className="sales-input-focus w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {employeesLoading ? (
              <p className="text-center text-gray-500 py-12">Loading employees…</p>
            ) : filteredEmployeeImports.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-3">👥</span>
                <p className="text-gray-600 font-medium">No employees found</p>
              </div>
            ) : (
              <div className="overflow-auto border border-gray-200 rounded-xl mx-2">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Total Leads
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Sheet Import
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Admin Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Single Lead
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Last Activity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployeeImports.map((emp) => (
                      <tr
                        key={emp.employeeId}
                        onClick={() => setSelectedEmployee(emp.employeeId)}
                        className="hover:bg-indigo-50/60 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {emp.fullname}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {emp.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {emp.totalLeads || 0}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {emp.sheetCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="font-medium text-emerald-700">
                                {emp.sheetCount}
                              </span>
                              <SourceBadge source="bulk_import" />
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {emp.adminAssignedCount > 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {emp.adminAssignedCount} assigned
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {emp.singleCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="font-medium text-sky-700">
                                {emp.singleCount}
                              </span>
                              <SourceBadge source="manual" />
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {emp.lastActivityDate
                            ? formatDisplayDate(emp.lastActivityDate)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {emp.isActive ? (
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : !selectedDate ? (
          <div className="flex-1 overflow-auto p-4">
            {datesLoading ? (
              <p className="text-center text-gray-500 py-12">Loading dates…</p>
            ) : dates.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-3">📋</span>
                <p className="text-gray-600 font-medium">
                  {employeeName} ke liye abhi koi lead history nahi hai
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Admin sheet assign ya employee self import/add ke baad yahan date-wise dikhega.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 px-1">
                  Date pe click karke us din assign / import hui leads dekho.
                </p>
                <div className="overflow-auto border border-gray-200 rounded-xl">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Total Assigned / Added
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Sheet Import
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Admin Assigned
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Single Lead
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Unassigned
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dates.map((item) => (
                        <tr
                          key={item.date}
                          onClick={() => setSelectedDate(item.date)}
                          className="hover:bg-indigo-50/60 cursor-pointer transition"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            <div>{formatDisplayDate(item.date)}</div>
                            {(item.adminAssignedCount > 0 || item.sheetCount > 0) && (
                              <div className="text-xs text-indigo-600 mt-0.5 font-normal">
                                {item.adminAssignedCount > 0
                                  ? `${item.adminAssignedCount} leads admin ne assign ki`
                                  : `${item.sheetCount} sheet import`}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.sheetCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="font-medium text-emerald-700">
                                  {item.sheetCount}
                                </span>
                                <SourceBadge source="bulk_import" />
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.adminAssignedCount > 0 ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {item.adminAssignedCount}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.singleCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="font-medium text-sky-700">
                                  {item.singleCount}
                                </span>
                                <SourceBadge source="manual" />
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.unassigned > 0 ? (
                              <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                {item.unassigned}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mx-6 mt-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-900">
              <span className="font-semibold">{formatDisplayDate(selectedDate)}</span>
              {" — "}
              <span className="font-bold">{leads.length}</span> leads{" "}
              {employeeName} ke liye
              {leads.filter((l) => l.assignedBy).length > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-semibold">
                    {leads.filter((l) => l.assignedBy).length} admin assigned
                  </span>
                </>
              )}
              {leads.filter((l) => l.source === "bulk_import").length > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-semibold text-emerald-800">
                    {leads.filter((l) => l.source === "bulk_import").length} sheet
                    import
                  </span>
                </>
              )}
            </div>
            <div className="px-6 py-3 border-b bg-gray-50/50 flex flex-wrap items-center gap-3 flex-shrink-0">
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search client, company, mobile, product…"
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
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        State
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Assigned To
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Assigned By
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
                          {lead.product || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-sm">
                          <SourceBadge source={lead.source} />
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
                        <td className="px-4 py-2.5 text-sm">
                          {lead.assignedBy ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Admin
                              {lead.assignedBy.fullname
                                ? ` · ${lead.assignedBy.fullname}`
                                : ""}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Self</span>
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
                    <span>{selectedAssignEmployee?.fullname || "Select Employee"}</span>
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
                        {filteredEmployeesForAssign.map((emp) => (
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
