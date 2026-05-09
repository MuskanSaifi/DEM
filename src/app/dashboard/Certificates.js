"use client";

import React, { useEffect, useMemo, useState } from "react";

function formatYMD(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Certificates() {
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [certificates, setCertificates] = useState([]);

  const [issueForm, setIssueForm] = useState(() => {
    const today = new Date();
    const valid = new Date();
    valid.setFullYear(today.getFullYear() + 1);
    return {
      userSlug: "",
      companyName: "",
      certificateNumber: "",
      issuedAt: formatYMD(today),
      validUntil: formatYMD(valid),
    };
  });
  const [phoneSearch, setPhoneSearch] = useState("");
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [lookupMessageType, setLookupMessageType] = useState("");

  const filtered = useMemo(() => certificates, [certificates]);

  const fetchList = async () => {
    setListLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/certificates?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Could not load certificates");
      setCertificates(data.certificates || []);
    } catch (e) {
      setError(e?.message || "Could not load certificates");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const normalized = (phoneSearch || "").replace(/[^\d]/g, "");
    if (!normalized) {
      setSlugSuggestions([]);
      setLookupMessage("");
      setLookupMessageType("");
      setLookupLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const res = await fetch(
          `/api/admin/certificates/user-lookup?phone=${encodeURIComponent(normalized)}`
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Lookup failed");
        }
        const suggestions = data.suggestions || [];
        setSlugSuggestions(suggestions);
        if (!data.registered) {
          setLookupMessage(data.message || "This number is not registered.");
          setLookupMessageType("error");
        } else if (suggestions.length && suggestions.every((s) => !s.profileComplete)) {
          setLookupMessage("This customer profile is incomplete.");
          setLookupMessageType("warning");
        } else {
          setLookupMessage("");
          setLookupMessageType("");
        }
      } catch (e) {
        setSlugSuggestions([]);
        setLookupMessage(e?.message || "Could not search phone number.");
        setLookupMessageType("error");
      } finally {
        setLookupLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [phoneSearch]);

  const handleIssue = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const trimmedUserSlug = issueForm.userSlug.trim();
      const trimmedCompanyName = issueForm.companyName.trim();
      if (!trimmedUserSlug && !trimmedCompanyName) {
        throw new Error("Company name is required when user profile slug is empty");
      }

      const payload = {
        userSlug: trimmedUserSlug || undefined,
        issuedAt: issueForm.issuedAt,
        validUntil: issueForm.validUntil,
        companyName: trimmedCompanyName || undefined,
        certificateNumber: issueForm.certificateNumber.trim() || undefined,
      };
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Could not issue certificate");
      setIssueForm((f) => ({ ...f, companyName: "", certificateNumber: "" }));
      await fetchList();
    } catch (e2) {
      setError(e2?.message || "Could not issue certificate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    const reason = window.prompt("Revoke reason (optional):", "");
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revoked", revokedReason: reason || "" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Could not revoke");
      await fetchList();
    } catch (e) {
      setError(e?.message || "Could not revoke");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Certificates</h2>
          <p className="text-sm text-gray-500">Issue certificates and manage status.</p>
        </div>
        <button
          type="button"
          onClick={fetchList}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold"
          disabled={listLoading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form onSubmit={handleIssue} className="lg:col-span-1 border rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Issue Certificate</h3>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Phone number lookup (optional)</label>
          <input
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="9876543210"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />
          {lookupLoading && (
            <div className="mt-2 text-xs text-gray-500">Searching profiles…</div>
          )}
          {!!lookupMessage && (
            <div
              className={`mt-2 text-xs px-2.5 py-2 rounded-md border ${
                lookupMessageType === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {lookupMessage}
            </div>
          )}
          {slugSuggestions.length > 0 && (
            <div className="mt-2 max-h-44 overflow-auto rounded-lg border bg-white">
              {slugSuggestions.map((s) => {
                const labelName = s.fullname || s.companyName || "Unnamed user";
                return (
                  <div key={s.userId} className="px-3 py-2 border-b last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {labelName}
                        </div>
                        <div className="text-[11px] text-gray-600 truncate">
                          {s.userProfileSlug || "No profile slug"}
                        </div>
                        {!s.profileComplete && (
                          <div className="text-[11px] text-amber-700">This customer profile is incomplete.</div>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={!s.userProfileSlug}
                        onClick={() =>
                          setIssueForm((f) => ({
                            ...f,
                            userSlug: s.userProfileSlug || "",
                            companyName: s.companyName || f.companyName,
                          }))
                        }
                        className="shrink-0 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold disabled:opacity-50"
                      >
                        Use slug
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <label className="block text-xs font-semibold text-gray-600 mt-3 mb-1">User profile slug (optional)</label>
          <input
            value={issueForm.userSlug}
            onChange={(e) => setIssueForm((f) => ({ ...f, userSlug: e.target.value }))}
            placeholder="gadget-galaxy-5802f3"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />

          <label className="block text-xs font-semibold text-gray-600 mt-3 mb-1">
            Company name {!issueForm.userSlug.trim() ? "*" : "(optional)"}
          </label>
          <input
            value={issueForm.companyName}
            onChange={(e) => setIssueForm((f) => ({ ...f, companyName: e.target.value }))}
            placeholder="BHARATAM HOME SOLUTIONS PRIVATE LIMITED"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            required={!issueForm.userSlug.trim()}
          />

          <label className="block text-xs font-semibold text-gray-600 mt-3 mb-1">Certificate number (optional)</label>
          <input
            value={issueForm.certificateNumber}
            onChange={(e) => setIssueForm((f) => ({ ...f, certificateNumber: e.target.value }))}
            placeholder="GRC9005VOUT9337"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Issue date *</label>
              <input
                type="date"
                value={issueForm.issuedAt}
                onChange={(e) => setIssueForm((f) => ({ ...f, issuedAt: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Valid upto *</label>
              <input
                type="date"
                value={issueForm.validUntil}
                onChange={(e) => setIssueForm((f) => ({ ...f, validUntil: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="mt-4 w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-60"
          >
            {actionLoading ? "Issuing…" : "Issue Certificate"}
          </button>
        </form>

        <div className="lg:col-span-2 border rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search company / certificate no / slug…"
                className="min-w-[240px] border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
              <button
                type="button"
                onClick={fetchList}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-semibold"
                disabled={listLoading}
              >
                {listLoading ? "Loading…" : "Apply"}
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {listLoading ? "Loading…" : `${filtered.length} record(s)`}
            </div>
          </div>

          <div className="mt-4 overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-xs uppercase text-gray-600">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Certificate No</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Valid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {listLoading ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                      No certificates found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const slug = c?.userId?.userProfileSlug;
                    const pdfUrl = slug
                      ? `/api/certificates/pdf/${slug}`
                      : c?.certificateNumber
                      ? `/api/certificates/pdf/${c.certificateNumber}`
                      : null;
                    return (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{c.companyName}</td>
                        <td className="px-4 py-3 font-mono">{c.certificateNumber}</td>
                        <td className="px-4 py-3">{formatYMD(c.issuedAt)}</td>
                        <td className="px-4 py-3">{formatYMD(c.validUntil)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              c.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : c.status === "revoked"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap flex flex-wrap gap-2">
                          {pdfUrl && (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                            >
                              View PDF
                            </a>
                          )}
                          {c.status === "active" && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(c._id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-60"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

