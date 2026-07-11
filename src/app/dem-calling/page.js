"use client";

import Link from "next/link";

export default function DemCallingHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="text-5xl mb-4">📞</div>
        <h1 className="text-3xl font-bold text-white mb-2">DEM Calling</h1>
        <p className="text-indigo-200 mb-8">
          Silent call monitoring — Admin real-time sun sakta hai, agent/client ko pata nahi chalega.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dem-calling/admin/login"
            className="block px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg transition"
          >
            Admin Panel
          </Link>
          <Link
            href="/dem-calling/user/login"
            className="block px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg transition"
          >
            User / Agent Panel
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-8">
          APIs: /api/dem-calling/* · Socket: /dem-calling namespace
        </p>
      </div>
    </div>
  );
}
