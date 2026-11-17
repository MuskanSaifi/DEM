"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
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

function addedByLabel(lead) {
  if (lead?.createdBy?.fullname) return lead.createdBy.fullname;
  if (lead?.source === "bulk_import") return "Admin";
  return "Admin";
}

function AssignBar({
  selectedCount,
  employees,
  assignTo,
  setAssignTo,
  employeeSearch,
  setEmployeeSearch,
  showAssignDropdown,
  setShowAssignDropdown,
  assigning,
  onAssign,
}) {
  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => (e.fullname || "").toLowerCase().includes(q));
  }, [employees, employeeSearch]);

  const selectedAssignEmployee = employees.find((e) => e._id === assignTo);

  if (selectedCount === 0) return null;

  return (
    <div className="px-6 py-4 border-t bg-amber-50 flex flex-wrap items-center gap-3 flex-shrink-0">
      <span className="font-semibold text-amber-900 text-sm">
        {selectedCount} selected
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAssignDropdown((p) => !p)}
          className="sales-input-focus border-2 border-amber-400 rounded-xl px-4 py-2 bg-white min-w-[200px] font-medium text-sm flex items-center justify-between gap-2"
        >
          <span>{selectedAssignEmployee?.fullname || "Select salesperson"}</span>
          <span className="text-xs text-gray-500">▾</span>
        </button>
        {showAssignDropdown && (
          <div className="absolute bottom-12 left-0 w-64 max-h-72 bg-white rounded-xl shadow-2xl border border-amber-300 p-2 z-50">
            <input
              type="text"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              placeholder="Search salesperson…"
              className="sales-input-focus w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">No match</p>
              ) : (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => {
                      setAssignTo(emp._id);
                      setEmployeeSearch(emp.fullname || "");
                      setShowAssignDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 ${
                      assignTo === emp._id ? "bg-amber-100 font-semibold" : ""
                    }`}
                  >
                    {emp.fullname}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onAssign}
        disabled={!assignTo || assigning}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition"
      >
        {assigning ? "Assigning…" : `Assign ${selectedCount} Lead(s)`}
      </button>
    </div>
  );
}

function FilterChip({ active, count, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start min-w-[118px] px-4 py-3 rounded-2xl border-2 text-left transition ${
        active
          ? "bg-cyan-600 border-cyan-600 text-white shadow-md"
          : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      <span className={`text-[11px] font-semibold uppercase tracking-wide ${active ? "text-cyan-100" : "text-gray-500"}`}>
        {label}
      </span>
      <span className="text-2xl font-bold leading-tight mt-0.5">{count}</span>
      {hint ? (
        <span className={`text-[11px] mt-0.5 ${active ? "text-cyan-100" : "text-gray-400"}`}>
          {hint}
        </span>
      ) : null}
    </button>
  );
}

export default function ImportDataHistory({
  open,
  onClose,
  employees,
  onAssignSuccess,
  refreshKey = 0,
}) {
  const [tab, setTab] = useState("unassigned");
  const [range, setRange] = useState("today");
  const [sourceFilter, setSourceFilter] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [counts, setCounts] = useState({
    all: 0,
    today: 0,
    last3days: 0,
    lastWeek: 0,
    sheetAll: 0,
    sheet: 0,
    single: 0,
    filtered: 0,
  });
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [unassignedLoading, setUnassignedLoading] = useState(false);

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

  const fetchUnassigned = useCallback(async () => {
    if (!token) return;
    setUnassignedLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ view: "unassigned", range });
      if (sourceFilter) params.set("source", sourceFilter);
      if (range === "custom") {
        if (customFrom) params.set("from", customFrom);
        if (customTo) params.set("to", customTo);
      }
      const res = await fetch(`/api/sales/leads/import-history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUnassignedLeads(data.leads || []);
        setCounts(
          data.counts || {
            all: 0,
            today: 0,
            last3days: 0,
            lastWeek: 0,
            sheetAll: 0,
            sheet: 0,
            single: 0,
            filtered: 0,
          }
        );
      } else {
        setError(data.message || "Failed to load new leads");
      }
    } catch (err) {
      setError("Failed to load new leads: " + err.message);
    } finally {
      setUnassignedLoading(false);
    }
  }, [token, range, sourceFilter, customFrom, customTo]);

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
    if (!open) return;
    setTab("unassigned");
    setRange("today");
    setSourceFilter("");
    setCustomFrom("");
    setCustomTo("");
    setSelectedEmployee(null);
    setSelectedEmployeeInfo(null);
    setSelectedDate(null);
    setDates([]);
    setLeads([]);
    setSelectedLeadIds([]);
    setListEmployeeSearch("");
    setTableSearch("");
    setAssignTo("");
    setEmployeeSearch("");
    setError("");
  }, [open, refreshKey]);

  useEffect(() => {
    if (!open) return;
    if (tab === "unassigned") {
      if (range === "custom" && (!customFrom || !customTo)) return;
      fetchUnassigned();
    }
  }, [open, tab, range, sourceFilter, customFrom, customTo, fetchUnassigned, refreshKey]);

  useEffect(() => {
    if (open && tab === "employee") {
      fetchEmployeeImports();
    }
  }, [open, tab, fetchEmployeeImports, refreshKey]);

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

  const filteredEmployeeImports = useMemo(() => {
    const q = listEmployeeSearch.trim().toLowerCase();
    if (!q) return employeeImports;
    return employeeImports.filter(
      (e) =>
        (e.fullname || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q)
    );
  }, [employeeImports, listEmployeeSearch]);

  const visibleLeads = tab === "unassigned" ? unassignedLeads : leads;

  const filteredLeads = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return visibleLeads;
    return visibleLeads.filter(
      (l) =>
        (l.clientName || "").toLowerCase().includes(q) ||
        (l.companyName || "").toLowerCase().includes(q) ||
        (l.mobile || "").includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.state || "").toLowerCase().includes(q) ||
        (l.product || "").toLowerCase().includes(q) ||
        addedByLabel(l).toLowerCase().includes(q)
    );
  }, [visibleLeads, tableSearch]);

  const selectableLeads = useMemo(
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
        const assignedName =
          employees.find((e) => e._id === assignTo)?.fullname || "salesperson";
        setSelectedLeadIds([]);
        setAssignTo("");
        setEmployeeSearch("");
        if (tab === "unassigned") {
          await fetchUnassigned();
        } else {
          await fetchLeadsForEmployeeDate(selectedEmployee, selectedDate);
          await fetchDatesForEmployee(selectedEmployee);
          await fetchEmployeeImports();
        }
        onAssignSuccess?.(
          data.message || `${selectedLeadIds.length} leads assigned to ${assignedName}`
        );
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

  const selectRange = (nextRange) => {
    setRange(nextRange);
    setSelectedLeadIds([]);
    setTableSearch("");
    if (nextRange !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
  };

  const employeeName = selectedEmployeeInfo?.fullname || "Employee";
  const employeeTitle = selectedDate
    ? `${employeeName} — ${formatDisplayDate(selectedDate)}`
    : selectedEmployee
      ? `${employeeName} — Select Date`
      : "Select Employee";

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                New Data
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Unassigned new leads — admin ya sales team ne jo add kiye, yahan se assign karein
              </p>
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
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTab("unassigned");
                setSelectedLeadIds([]);
                setError("");
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "unassigned"
                  ? "bg-cyan-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              New Unassigned
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                tab === "unassigned" ? "bg-white/20" : "bg-white text-gray-700"
              }`}>
                {counts.all}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("employee");
                setSelectedLeadIds([]);
                setError("");
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "employee"
                  ? "bg-cyan-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              By Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-3 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {tab === "unassigned" ? (
          <>
            <div className="px-6 pt-4 pb-3 flex-shrink-0 space-y-3">
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={range === "all"}
                  count={counts.all}
                  label="All new"
                  hint="Unassigned"
                  onClick={() => selectRange("all")}
                />
                <FilterChip
                  active={range === "today"}
                  count={counts.today}
                  label="Today"
                  hint="Added today"
                  onClick={() => selectRange("today")}
                />
                <FilterChip
                  active={range === "3days"}
                  count={counts.last3days}
                  label="Last 3 days"
                  onClick={() => selectRange("3days")}
                />
                <FilterChip
                  active={range === "week"}
                  count={counts.lastWeek}
                  label="Last week"
                  onClick={() => selectRange("week")}
                />
                <div
                  className={`flex flex-col justify-center min-w-[240px] px-4 py-2 rounded-2xl border-2 ${
                    range === "custom"
                      ? "bg-cyan-50 border-cyan-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Calendar
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      max={customTo || undefined}
                      onChange={(e) => {
                        setCustomFrom(e.target.value);
                        setRange("custom");
                        setSelectedLeadIds([]);
                      }}
                      className="sales-input-focus border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                      type="date"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={(e) => {
                        setCustomTo(e.target.value);
                        setRange("custom");
                        setSelectedLeadIds([]);
                      }}
                      className="sales-input-focus border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-1">
                  Source
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSourceFilter("");
                    setSelectedLeadIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    sourceFilter === ""
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  All ({(counts.sheet || 0) + (counts.single || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceFilter("bulk_import");
                    setSelectedLeadIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    sourceFilter === "bulk_import"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400"
                  }`}
                >
                  Sheet Import ({counts.sheet || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceFilter("manual");
                    setSelectedLeadIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    sourceFilter === "manual"
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-sky-50 text-sky-800 border-sky-200 hover:border-sky-400"
                  }`}
                >
                  Single ({counts.single || 0})
                </button>
                {(counts.sheetAll || 0) > 0 && sourceFilter !== "bulk_import" && (
                  <span className="text-xs text-emerald-700">
                    {counts.sheetAll} unassigned sheet lead{counts.sheetAll === 1 ? "" : "s"} total
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">{filteredLeads.length}</span>
                {" "}unassigned lead{filteredLeads.length === 1 ? "" : "s"}
                {sourceFilter === "bulk_import" && " from admin sheet import"}
                {sourceFilter === "manual" && " added one-by-one"}
                {range === "today" && " · today"}
                {range === "3days" && " · last 3 days"}
                {range === "week" && " · last 7 days"}
                {range === "custom" && customFrom && customTo && (
                  <> · {formatDisplayDate(customFrom)} to {formatDisplayDate(customTo)}</>
                )}
                {range === "all" && " · all unassigned"}
                . Assign ke baad yeh list se hat jayengi.
              </p>
            </div>

            <div className="px-6 py-3 border-y bg-gray-50/50 flex flex-wrap items-center gap-3 flex-shrink-0">
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search client, company, mobile, product, added by…"
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
              />
              <button
                type="button"
                onClick={() => setSelectedLeadIds(selectableLeads.map((l) => l._id))}
                disabled={selectableLeads.length === 0}
                className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Select All ({selectableLeads.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedLeadIds([])}
                disabled={selectedLeadIds.length === 0}
                className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {unassignedLoading ? (
                <p className="text-center text-gray-500 py-12">Loading new leads…</p>
              ) : range === "custom" && (!customFrom || !customTo) ? (
                <div className="text-center py-16">
                  <span className="text-5xl block mb-3">📅</span>
                  <p className="text-gray-600 font-medium">From aur To date select karein</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-5xl block mb-3">
                    {sourceFilter === "bulk_import" ? "📄" : "✨"}
                  </span>
                  <p className="text-gray-600 font-medium">
                    {sourceFilter === "bulk_import"
                      ? "Is period mein koi unassigned sheet import nahi hai"
                      : "Is period mein koi unassigned new lead nahi hai"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                    {sourceFilter === "bulk_import"
                      ? "Bulk Import mein Assign to Employee Unassigned chhod kar sheet upload karein — woh yahan Sheet Import ki tarah dikhengi."
                      : "Today / Last 3 days / Last week / Calendar se dusra filter try karein"}
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={
                            selectableLeads.length > 0 &&
                            selectedLeadIds.length === selectableLeads.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds(selectableLeads.map((l) => l._id));
                            } else {
                              setSelectedLeadIds([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Added by</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Added on</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead._id}
                        className={`hover:bg-gray-50 ${
                          selectedLeadIds.includes(lead._id)
                            ? "bg-indigo-50/40"
                            : lead.source === "bulk_import"
                              ? "bg-emerald-50/50"
                              : ""
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
                        <td className="px-4 py-2.5 text-sm">
                          {lead.source === "bulk_import" && !lead.createdBy?.fullname ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-white">
                              Admin · Sheet
                            </span>
                          ) : lead.createdBy?.fullname ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                              {lead.createdBy.fullname}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                          {formatDateTime(lead.importedAt || lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <AssignBar
              selectedCount={selectedLeadIds.length}
              employees={employees}
              assignTo={assignTo}
              setAssignTo={setAssignTo}
              employeeSearch={employeeSearch}
              setEmployeeSearch={setEmployeeSearch}
              showAssignDropdown={showAssignDropdown}
              setShowAssignDropdown={setShowAssignDropdown}
              assigning={assigning}
              onAssign={handleAssign}
            />
          </>
        ) : !selectedEmployee ? (
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Leads</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sheet Import</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admin Assigned</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Single Lead</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Activity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployeeImports.map((emp) => (
                      <tr
                        key={emp.employeeId}
                        onClick={() => setSelectedEmployee(emp.employeeId)}
                        className="hover:bg-indigo-50/60 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.fullname}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{emp.email || "—"}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{emp.totalLeads || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          {emp.sheetCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="font-medium text-emerald-700">{emp.sheetCount}</span>
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
                              <span className="font-medium text-sky-700">{emp.singleCount}</span>
                              <SourceBadge source="manual" />
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {emp.lastActivityDate ? formatDisplayDate(emp.lastActivityDate) : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {emp.isActive ? (
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>
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
            <button
              type="button"
              onClick={() => {
                setSelectedEmployee(null);
                setSelectedEmployeeInfo(null);
                setDates([]);
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-3"
            >
              ← Back to employees
            </button>
            <h3 className="text-base font-semibold text-gray-900 mb-3">{employeeTitle}</h3>
            {datesLoading ? (
              <p className="text-center text-gray-500 py-12">Loading dates…</p>
            ) : dates.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-3">📋</span>
                <p className="text-gray-600 font-medium">
                  {employeeName} ke liye abhi koi lead history nahi hai
                </p>
              </div>
            ) : (
              <div className="overflow-auto border border-gray-200 rounded-xl">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sheet Import</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admin Assigned</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Single Lead</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unassigned</th>
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
                          {formatDisplayDate(item.date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.count}</td>
                        <td className="px-4 py-3 text-sm">{item.sheetCount || 0}</td>
                        <td className="px-4 py-3 text-sm">{item.adminAssignedCount || 0}</td>
                        <td className="px-4 py-3 text-sm">{item.singleCount || 0}</td>
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
            )}
          </div>
        ) : (
          <>
            <div className="px-6 pt-3 flex-shrink-0">
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
                ← Back to dates
              </button>
              <div className="mt-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-900">
                <span className="font-semibold">{formatDisplayDate(selectedDate)}</span>
                {" — "}
                <span className="font-bold">{leads.length}</span> leads {employeeName} ke liye
              </div>
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
                onClick={() => setSelectedLeadIds(selectableLeads.map((l) => l._id))}
                disabled={selectableLeads.length === 0}
                className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Select All Unassigned ({selectableLeads.length})
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
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
                        <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{lead.clientName}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{lead.companyName || "—"}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{lead.mobile}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{lead.product || "—"}</td>
                        <td className="px-4 py-2.5 text-sm">
                          <SourceBadge source={lead.source} />
                        </td>
                        <td className="px-4 py-2.5 text-sm">
                          {lead.assignedTo ? (
                            <span className="text-green-700 font-medium">{lead.assignedTo.fullname}</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <AssignBar
              selectedCount={selectedLeadIds.length}
              employees={employees}
              assignTo={assignTo}
              setAssignTo={setAssignTo}
              employeeSearch={employeeSearch}
              setEmployeeSearch={setEmployeeSearch}
              showAssignDropdown={showAssignDropdown}
              setShowAssignDropdown={setShowAssignDropdown}
              assigning={assigning}
              onAssign={handleAssign}
            />
          </>
        )}
      </div>
    </div>
  );
}
