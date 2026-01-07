// src/components/TemplateFilters.js
"use client";
import { useState } from "react";

export default function TemplateFilters({ onChange }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [industry, setIndustry] = useState("");

  const applyFilters = () => {
    onChange({ search, type, industry });
  };

  return (
    <div className="bg-white shadow p-5 max-w-7xl mx-auto -mt-8 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          placeholder="Search template..."
          className="border px-3 py-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="web">Web</option>
          <option value="mobile">Mobile</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">All Industries</option>
          <option value="Interior">Interior</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
        </select>

        <button
          onClick={applyFilters}
          className="bg-indigo-600 text-white rounded px-4 py-2"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
