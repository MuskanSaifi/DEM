"use client";

import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const EMPTY_FORM = {
  fullname: "",
  email: "",
  password: "",
  mobileNumber: "",
};

export default function AddEmployeeModal({ open, onClose, onSuccess, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setShowPassword(false);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("salesAdminToken");
    try {
      const res = await fetch("/api/sales/admin/add-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        onError?.(data.message || "Failed to add employee");
      }
    } catch {
      onError?.("Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b">
          <h2 className="text-lg font-bold text-gray-900">Add Sales Employee</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            aria-label="Close add employee"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              required
              value={form.fullname}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullname: e.target.value }))
              }
              className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            />
            <input
              type="email"
              placeholder="Email *"
              required
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            <input
              type="tel"
              placeholder="Mobile"
              value={form.mobileNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, mobileNumber: e.target.value }))
              }
              className="sales-input-focus border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition text-sm disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
