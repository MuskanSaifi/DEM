"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

function formatYMD(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Certificates() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    setSlug(user?.userProfileSlug || "");

    const run = async () => {
      if (!token) {
        setLoading(false);
        setError("Please login again.");
        return;
      }
      try {
        const res = await axios.get("/api/userprofile/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data.success) throw new Error(res.data.message || "Could not load");
        setCertificates(res.data.certificates || []);
      } catch (e) {
        setError(e?.message || "Could not load certificates");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Certificates</h2>
          <p className="text-sm text-gray-500">Your issued certificates.</p>
        </div>
        {slug && (
          <a
            href={`/api/certificates/pdf/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            Open PDF
          </a>
        )}
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase text-gray-600">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Certificate No</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Valid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No certificates found.
                </td>
              </tr>
            ) : (
              certificates.map((c) => (
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
                  <td className="px-4 py-3">
                    {slug ? (
                      <a
                        href={`/api/certificates/pdf/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

