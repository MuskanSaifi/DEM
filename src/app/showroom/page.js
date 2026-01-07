"use client";
import { useEffect, useState } from "react";
import TemplateCard from "@/components/TemplateCard";
import TemplateFilters from "@/components/TemplateFilters";

export default function ShowroomPage() {
  const [templates, setTemplates] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchTemplates = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/templates?${query}`);
    const data = await res.json();
    setTemplates(data.templates);
  };

  useEffect(() => {
    fetchTemplates(filters);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-14 text-center">
        <h1 className="text-4xl font-bold">Website Showroom</h1>
        <p className="mt-3 text-lg opacity-90">
          Choose a premium template & launch your business online
        </p>
      </div>

      {/* Filters */}
      <TemplateFilters onChange={setFilters} />

      {/* Templates */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((t) => (
          <TemplateCard key={t._id} template={t} />
        ))}

        {templates.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No templates found
          </p>
        )}
      </div>
    </div>
  );
}
