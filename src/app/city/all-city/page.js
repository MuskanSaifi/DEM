// src/app/city/all-city/page.js
"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FaMapMarkerAlt, FaCity, FaSearch } from "react-icons/fa";

export default function AllCityPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/city/location/all-city")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStates(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Filter logic
  const filteredStates = useMemo(() => {
    if (!search.trim()) return states;

    const term = search.toLowerCase();

    return states
      .map((state) => {
        const filteredCities = state.cities.filter(
          (c) =>
            c.city.toLowerCase().includes(term) ||
            state._id.toLowerCase().includes(term)
        );
        if (filteredCities.length === 0) return null;
        return { ...state, cities: filteredCities };
      })
      .filter(Boolean);
  }, [search, states]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading cities...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Explore Businesses Across India
        </h1>
        <p className="text-gray-500 mt-2">
          Search cities or states to find suppliers faster
        </p>
      </div>

      {/* 🔍 Search */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border rounded-full focus:ring-2
            focus:ring-purple-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* No Result */}
      {!filteredStates.length && (
        <p className="text-center text-gray-500">
          No cities found for “{search}”
        </p>
      )}

      {/* State Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStates.map((state) => (
          <div
            key={state._id}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all"
          >
            {/* State Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b bg-gray-50 rounded-t-xl">
              <FaMapMarkerAlt className="text-purple-600" />
              <h2 className="text-lg font-semibold capitalize text-purple-700">
                {state._id}
              </h2>
            </div>

            {/* Cities */}
            <ul className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
              {state.cities.map((c) => (
                <li key={c.city}>
                  <Link
                    href={`/city/${c.city.toLowerCase()}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg
                    hover:bg-purple-50 transition"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaCity className="text-gray-400 text-sm" />
                      <span className="capitalize">{c.city}</span>
                    </div>

                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {c.totalProducts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}