"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Award,
  FileText,
  Upload,
  Eye,
  Trash2,
  ShieldCheck,
  Plus,
  ExternalLink,
} from "lucide-react";

function formatYMD(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(n) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Certificates() {
  const [loading, setLoading] = useState(true);
  const [grcCertificates, setGrcCertificates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const loadAll = useCallback(async () => {
    const token = getToken();
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    setSlug(user?.userProfileSlug || "");

    if (!token) {
      setLoading(false);
      setError("Please login again.");
      return;
    }

    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [grcRes, docsRes] = await Promise.all([
        axios.get("/api/userprofile/certificates", { headers }),
        axios.get("/api/userprofile/certificates/documents", { headers }),
      ]);

      if (!grcRes.data.success) throw new Error(grcRes.data.message || "Could not load GRC");
      if (!docsRes.data.success) throw new Error(docsRes.data.message || "Could not load documents");

      setGrcCertificates(grcRes.data.certificates || []);
      setDocuments(docsRes.data.documents || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not load certificates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!uploadTitle.trim()) {
      setUploadError("Enter a name for this certificate (e.g. GST Certificate, IEC).");
      return;
    }
    if (!uploadFile) {
      setUploadError("Select a PDF file.");
      return;
    }
    if (uploadFile.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    const token = getToken();
    if (!token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", uploadTitle.trim());
      formData.append("file", uploadFile);

      const res = await axios.post("/api/userprofile/certificates/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data.success) throw new Error(res.data.message || "Upload failed");

      setUploadTitle("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowUploadForm(false);
      await loadAll();
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm("Delete this certificate from your locker?")) return;
    const token = getToken();
    try {
      await axios.delete(`/api/userprofile/certificates/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not delete");
    }
  };

  const onFilePick = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }
    setUploadError("");
    setUploadFile(file);
    if (!uploadTitle.trim()) {
      const base = file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
      setUploadTitle(base.slice(0, 80));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Certificate Locker</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                View your GRC certificate issued by admin and store other certificates like DigiLocker.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUploadForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Upload certificate
          </button>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {showUploadForm && (
          <form
            onSubmit={handleUpload}
            className="mt-5 p-4 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40"
          >
            <p className="text-sm font-semibold text-gray-800 mb-3">Upload PDF certificate</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Certificate name *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. GST Registration, IEC, Trade License"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  PDF file * (max 10 MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => onFilePick(e.target.files?.[0])}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-800 file:font-medium"
                />
              </div>
            </div>
            {uploadFile && (
              <p className="mt-2 text-xs text-gray-600">
                Selected: {uploadFile.name} ({formatBytes(uploadFile.size)})
              </p>
            )}
            {uploadError && (
              <p className="mt-2 text-xs text-red-600 font-medium">{uploadError}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Save to locker"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadError("");
                  setUploadFile(null);
                  setUploadTitle("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* GRC – admin issued */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-600" />
          GRC Certificate (issued by admin)
        </h3>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : grcCertificates.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            No GRC certificate issued yet. Contact admin when your GRC is ready.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grcCertificates.map((c) => (
              <article
                key={c._id}
                className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Award className="h-6 w-6" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : c.status === "revoked"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <h4 className="mt-3 font-bold text-gray-900 leading-tight">
                  {c.companyName || "GRC Certificate"}
                </h4>
                <p className="mt-1 text-xs font-mono text-gray-600">{c.certificateNumber}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Issued {formatYMD(c.issuedAt)} · Valid till {formatYMD(c.validUntil)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {slug && c.status === "active" && (
                    <a
                      href={`/api/certificates/pdf/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View PDF
                    </a>
                  )}
                  <a
                    href={`/grc-certificate?certNo=${encodeURIComponent(c.certificateNumber || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Verify
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* User uploaded – DigiLocker style */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-600" />
          My uploaded certificates
        </h3>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div
            className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-6 py-12 text-center cursor-pointer hover:bg-violet-50/50 transition"
            onClick={() => setShowUploadForm(true)}
            onKeyDown={(e) => e.key === "Enter" && setShowUploadForm(true)}
            role="button"
            tabIndex={0}
          >
            <Upload className="h-10 w-10 mx-auto text-violet-400 mb-3" />
            <p className="font-medium text-gray-700">No certificates uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload GST, IEC, trade license or any PDF — stored securely in your locker.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <article
                key={doc._id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatYMD(doc.createdAt)}
                      {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-4">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc._id)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
