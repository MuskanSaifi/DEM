"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  FileDown,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";

function normalizeCertNo(value) {
  return (value || "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function formatCertDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailBlock({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600"
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="mt-0.5 text-sm font-bold text-gray-900 break-words">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GrcCertificateClient({ initialCertNo = "" }) {
  const router = useRouter();

  const certNoFromUrl = normalizeCertNo(initialCertNo);

  const [certNo, setCertNo] = useState(certNoFromUrl);
  const [submitted, setSubmitted] = useState(certNoFromUrl);
  const [error, setError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    if (certNoFromUrl && certNoFromUrl !== submitted) {
      setSubmitted(certNoFromUrl);
      setCertNo(certNoFromUrl);
      setError("");
    }
  }, [certNoFromUrl, submitted]);

  useEffect(() => {
    if (!submitted) {
      setVerified(null);
      setVerifyError("");
      setVerifyLoading(false);
      return;
    }

    let cancelled = false;
    setVerifyLoading(true);
    setVerifyError("");
    setVerified(null);

    fetch(`/api/certificates/verify/${encodeURIComponent(submitted)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setVerified(null);
          setVerifyError(data.message || "Certificate not found");
          return;
        }
        setVerified(data.certificate || null);
        setVerifyError("");
      })
      .catch(() => {
        if (!cancelled) {
          setVerified(null);
          setVerifyError("Could not verify certificate.");
        }
      })
      .finally(() => {
        if (!cancelled) setVerifyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [submitted]);

  const pdfUrl = submitted
    ? `/api/certificates/pdf/${encodeURIComponent(submitted)}`
    : "";

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

    router.push(`/grc-certificate?certNo=${encodeURIComponent(normalized)}`);
  };

  const status = verified?.status;
  const isActiveVerified = verified && status === "active" && !verifyLoading && !verifyError;
  const isRevoked = verified && status === "revoked" && !verifyLoading && !verifyError;
  const isExpired = verified && status === "expired" && !verifyLoading && !verifyError;

  return (
    <div className="relative min-h-[78vh] overflow-hidden bg-[#f3f0ff]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(167 139 250 / 0.45) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
      <svg
        className="pointer-events-none absolute -right-16 bottom-0 h-64 w-96 text-violet-200/60"
        viewBox="0 0 400 200"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 180 Q 100 120 200 150 T 400 130 V 200 H 0 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className="pointer-events-none absolute -left-8 top-24 h-48 w-72 text-violet-200/50"
        viewBox="0 0 300 150"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 60 Q 80 20 160 50 T 300 40 V 0 H 0 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-violet-100/90 bg-white p-6 shadow-xl shadow-violet-200/40 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-300/50">
                <ShieldCheck className="h-7 w-7" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-[1.65rem]">
                  GRC Certificate
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Enter your certificate number to view and verify your certificate.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Certificate number
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="e.g. GRC9005VOUT9337"
                  className="min-h-[2.75rem] flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-md shadow-violet-300/40 transition hover:bg-violet-700 active:scale-[0.99]"
                >
                  <Search className="h-4 w-4" aria-hidden />
                  Search
                </button>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </form>

            {submitted && (
              <div className="mt-6 space-y-5">
                {verifyLoading && (
                  <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                    <div className="h-5 w-5 animate-pulse rounded-full bg-violet-300" />
                    Verifying certificate…
                  </div>
                )}

                {!verifyLoading && verifyError && (
                  <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold">Verification failed</span>
                    <span className="text-red-700">{verifyError}</span>
                  </div>
                )}

                {!verifyLoading && !verifyError && verified && (
                  <>
                    <div
                      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                        isActiveVerified
                          ? "border-emerald-200 bg-emerald-50/90"
                          : isRevoked
                            ? "border-red-200 bg-red-50/90"
                            : "border-amber-200 bg-amber-50/90"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            isActiveVerified
                              ? "bg-emerald-100 text-emerald-600"
                              : isRevoked
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div>
                          <div
                            className={`font-bold ${
                              isActiveVerified
                                ? "text-emerald-900"
                                : isRevoked
                                  ? "text-red-900"
                                  : "text-amber-900"
                            }`}
                          >
                            {isActiveVerified
                              ? "Certificate Verified"
                              : isRevoked
                                ? "Certificate revoked"
                                : "Certificate expired"}
                          </div>
                          <div
                            className={`text-sm ${
                              isActiveVerified
                                ? "text-emerald-700"
                                : isRevoked
                                  ? "text-red-700"
                                  : "text-amber-800"
                            }`}
                          >
                            {isActiveVerified
                              ? "This certificate is valid and active."
                              : isRevoked
                                ? "This certificate is no longer valid."
                                : "This certificate is past its validity period."}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${
                          isActiveVerified
                            ? "bg-emerald-600 text-white"
                            : isRevoked
                              ? "bg-red-600 text-white"
                              : "bg-amber-600 text-white"
                        }`}
                      >
                        {isActiveVerified ? "✓ Valid" : isRevoked ? "Revoked" : "Expired"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
                        <DetailBlock icon={FileText} label="Certificate number">
                          <span className="font-mono">
                            {verified.certificateNumber ?? submitted}
                          </span>
                        </DetailBlock>
                        <DetailBlock icon={Building2} label="Company name">
                          {verified.companyName ?? "—"}
                        </DetailBlock>
                        <DetailBlock icon={Calendar} label="Issue date">
                          {formatCertDate(verified.issuedAt)}
                        </DetailBlock>
                        <DetailBlock icon={Calendar} label="Valid until">
                          {formatCertDate(verified.validUntil)}
                        </DetailBlock>
                      </div>

                      <div className="flex shrink-0 justify-center lg:justify-end lg:self-center">
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-600 bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 hover:text-violet-800"
                        >
                          <FileDown className="h-5 w-5 shrink-0" aria-hidden />
                          Open PDF
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
                      <ShieldCheck
                        className="h-4 w-4 text-violet-500"
                        aria-hidden
                      />
                      All certificates are verified from official sources and are
                      100% authentic.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
