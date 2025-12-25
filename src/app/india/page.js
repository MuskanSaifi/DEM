"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/universal/product/get-product`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        // Handle API returning an array directly
        const products = Array.isArray(data) ? data : data.products;

        if (!products || !Array.isArray(products)) {
          console.error("Invalid API response structure:", data);
          throw new Error("Invalid API response structure");
        }

        // Extract unique cities, ignoring undefined/missing ones
        const uniqueCities = [
          ...new Set(products.map((p) => p?.city).filter((city) => city && city.trim() !== ""))
        ];

        setCities(uniqueCities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select a City</h1>

      {loading && <p>Loading cities...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cities.length > 0 ? (
          cities.map((city) => (
            <Link key={city} href={`/india/${city}`} className="border p-4 rounded shadow hover:bg-gray-100 text-center">
              {city}
            </Link>
          ))
        ) : (
          <p>Please Wait...</p>
        )}
      </div>
    </div>
  );
};

export default CitiesPage;
