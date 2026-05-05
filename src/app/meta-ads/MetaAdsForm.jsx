'use client';

import { useState } from "react";

const businessOptions = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "supplier", label: "Supplier" },
  { value: "wholeseller", label: "Wholeseller" },
];

const MetaAdsForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    businessType: "",
    companyName: "",
    email: "",
    message: "",
    agree: false,
  });
  const [status, setStatus] = useState({ loading: false, success: "", error: "" });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, success: "", error: "" });

    if (!formData.fullName.trim() || !formData.mobileNumber.trim() || !formData.businessType) {
      setStatus({ loading: false, success: "", error: "Please complete all required fields." });
      return;
    }

    if (!formData.agree) {
      setStatus({ loading: false, success: "", error: "Please agree to the terms and conditions." });
      return;
    }

    try {
      const response = await fetch("/api/meta-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          businessType: formData.businessType,
          companyName: formData.companyName,
          email: formData.email,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus({ loading: false, success: "", error: result.error || result.message || "Submission failed." });
        return;
      }

      setStatus({ loading: false, success: result.message || "Submitted successfully.", error: "" });
      setFormData({ fullName: "", mobileNumber: "", businessType: "", companyName: "", email: "", message: "", agree: false });
    } catch (error) {
      console.error(error);
      setStatus({ loading: false, success: "", error: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8 lg:p-10">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Join Now – It&apos;s Free!</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Fill the form below and our team will contact you.</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Full Name *</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Mobile Number *</label>
          <input
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="Enter your 10 digit mobile number"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Business Type *</label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            required
          >
            <option value="">Select Business Type</option>
            {businessOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Company / Brand Name</label>
          <input
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter your company or brand name"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email ID</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Enter your email address"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tell us about your business (Optional)</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Write about your products / services (Max 300 characters)"
            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            maxLength={300}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="agree"
            name="agree"
            type="checkbox"
            checked={formData.agree}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="agree" className="text-sm text-slate-700">
            I agree to the <span className="font-semibold text-blue-700">Terms & Conditions</span> and <span className="font-semibold text-blue-700">Privacy Policy</span>
          </label>
        </div>

        {status.error ? <p className="text-sm text-red-600">{status.error}</p> : null}
        {status.success ? <p className="text-sm text-green-600">{status.success}</p> : null}

        <button
          type="submit"
          disabled={status.loading}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {status.loading ? "Submitting..." : "APPLY NOW – IT'S FREE"}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">Your information is safe with us. We will never share your details.</p>
    </div>
  );
};

export default MetaAdsForm;
