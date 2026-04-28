"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function normalizeCertNo(value) {
  return (value || "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export default function GrcCertificateClient({ initialCertNo = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const certNoFromUrl = useMemo(() => normalizeCertNo(searchParams.get("certNo") || ""), [searchParams]);
  const [certNo, setCertNo] = useState(certNoFromUrl || normalizeCertNo(initialCertNo));
  const [submitted, setSubmitted] = useState(certNoFromUrl || normalizeCertNo(initialCertNo));
  const [error, setError] = useState("");

  useEffect(() => {
    if (certNoFromUrl && certNoFromUrl !== submitted) {
      setSubmitted(certNoFromUrl);
      setCertNo(certNoFromUrl);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certNoFromUrl]);

  const pdfUrl = submitted ? `/api/certificates/pdf/${encodeURIComponent(submitted)}` : "";

  const onSubmit = (e) => {
    e.preventDefault();
    const normalized = normalizeCertNo(certNo);
    if (!normalized) {
      setError("Please enter certificate number.");
      setSubmitted("");
      router.replace("/grc-certificate");
      return;
    }
    setError("");
    setSubmitted(normalized);
    router.replace(`/grc-certificate?certNo=${encodeURIComponent(normalized)}`);
  };

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">GRC Certificate</h1>
              <p className="text-sm text-gray-600">
                Enter your certificate number to view and verify your certificate.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Certificate number</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="e.g. GRC9005VOUT9337"
                  className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold"
                >
                  Search
                </button>
              </div>
              {error && (
                <div className="mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
            </form>

            {submitted && (
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm">
                    <div className="text-gray-600">Certificate number</div>
                    <div className="font-mono font-semibold text-gray-900">{submitted}</div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold"
                    >
                      Open PDF
                    </a>
                  </div>
                </div>
{/* 
                <div className="mt-4 border rounded-2xl overflow-hidden bg-gray-100">
                  <iframe
                    title="GRC Certificate PDF"
                    src={pdfUrl}
                    className="w-full h-[75vh] bg-white"
                  />
                </div> */}

                {/* <p className="mt-3 text-xs text-gray-500">
                  If the PDF doesn’t show in your browser, use the “Open PDF” button.
                </p> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

