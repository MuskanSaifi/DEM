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
  Smartphone,
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
  const [pendingCertNo, setPendingCertNo] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedMobile, setMaskedMobile] = useState("");
  const [step, setStep] = useState("search"); // search | otp | verified
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    if (certNoFromUrl) {
      setCertNo(certNoFromUrl);
    }
  }, [certNoFromUrl]);

  const pdfUrl = (() => {
    if (!verified || verified.status !== "active") return "";
    if (verified.userProfileSlug) {
      return `/api/certificates/pdf/${verified.userProfileSlug}`;
    }
    const certNumber = verified.certificateNumber || pendingCertNo;
    if (!certNumber) return "";
    return `/api/certificates/pdf/${encodeURIComponent(certNumber)}?certNo=${encodeURIComponent(certNumber)}`;
  })();

  const onSearch = async (e) => {
    e.preventDefault();
    const normalized = normalizeCertNo(certNo);

    if (!normalized) {
      setError("Please enter certificate number.");
      return;
    }

    setError("");
    setVerifyError("");
    setVerified(null);
    setOtp("");
    setSendOtpLoading(true);

    try {
      const res = await fetch("/api/certificates/verify/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: normalized }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Could not send OTP");
        return;
      }

      setPendingCertNo(normalized);
      setMaskedMobile(data.maskedMobile || "your registered mobile");
      setStep("otp");
      router.push(`/grc-certificate?certNo=${encodeURIComponent(normalized)}`);
    } catch {
      setError("Could not send OTP. Please try again.");
    } finally {
      setSendOtpLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setVerifyError("Please enter the OTP.");
      return;
    }

    setVerifyOtpLoading(true);
    setVerifyError("");

    try {
      const res = await fetch("/api/certificates/verify/confirm-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateNumber: pendingCertNo,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerifyError(data.message || "Invalid OTP");
        return;
      }

      setVerified(data.certificate);
      setStep("verified");
    } catch {
      setVerifyError("Could not verify OTP. Please try again.");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!pendingCertNo) return;
    setSendOtpLoading(true);
    setVerifyError("");
    try {
      const res = await fetch("/api/certificates/verify/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: pendingCertNo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setVerifyError(data.message || "Could not resend OTP");
        return;
      }
      setMaskedMobile(data.maskedMobile || maskedMobile);
      setOtp("");
    } catch {
      setVerifyError("Could not resend OTP");
    } finally {
      setSendOtpLoading(false);
    }
  };

  const status = verified?.status;
  const isActiveVerified = verified && status === "active";
  const isRevoked = verified && status === "revoked";
  const isExpired = verified && status === "expired";

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
                  Enter certificate number — OTP will be sent to the registered mobile number.
                </p>
              </div>
            </div>

            {step === "search" && (
              <form onSubmit={onSearch} className="mt-6">
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
                    disabled={sendOtpLoading}
                    className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-md shadow-violet-300/40 transition hover:bg-violet-700 disabled:opacity-60 active:scale-[0.99]"
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    {sendOtpLoading ? "Sending OTP…" : "Search"}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </form>
            )}

            {step === "otp" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">OTP sent</p>
                      <p className="text-violet-700 mt-0.5">
                        Enter the 4-digit OTP sent to <strong>{maskedMobile}</strong> for
                        certificate <span className="font-mono">{pendingCertNo}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={onVerifyOtp}>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Enter OTP
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="4-digit OTP"
                      className="min-h-[2.75rem] flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm tracking-[0.3em] text-center font-mono text-gray-900 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                    <button
                      type="submit"
                      disabled={verifyOtpLoading}
                      className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-md disabled:opacity-60 hover:bg-violet-700"
                    >
                      {verifyOtpLoading ? "Verifying…" : "Verify OTP"}
                    </button>
                  </div>
                  {verifyError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {verifyError}
                    </div>
                  )}
                </form>

                <div className="flex flex-wrap gap-3 text-sm">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={sendOtpLoading}
                    className="text-violet-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("search");
                      setOtp("");
                      setVerifyError("");
                      setPendingCertNo("");
                    }}
                    className="text-gray-500 hover:underline"
                  >
                    Change certificate number
                  </button>
                </div>
              </div>
            )}

            {step === "verified" && verified && (
              <div className="mt-6 space-y-5">
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
                        {verified.certificateNumber ?? pendingCertNo}
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

                  {isActiveVerified && pdfUrl && (
                    <div className="flex shrink-0 justify-center lg:justify-end lg:self-center">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-600 bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50"
                      >
                        <FileDown className="h-5 w-5 shrink-0" aria-hidden />
                        View PDF
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
                  <ShieldCheck className="h-4 w-4 text-violet-500" aria-hidden />
                  All certificates are verified from official sources and are 100% authentic.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
