"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FilterSidebarClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [minPrice, setMinPrice] = useState(params.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") || "");
  const [moq, setMoq] = useState(params.get("moq") || "");

  const applyFilter = () => {
    const query = new URLSearchParams(params.toString());

    if (minPrice) query.set("min", minPrice);
    if (maxPrice) query.set("max", maxPrice);
    if (moq) query.set("moq", moq);

    router.push("?" + query.toString());
  };

  return (
    <div className="w-64 bg-white border rounded-xl p-4 sticky top-24 h-fit">
      <h3 className="font-semibold mb-3">Filter By</h3>

      <div className="mb-4">
        <p className="text-sm font-medium mb-1">Price Range</p>
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border p-1 w-full mb-2 text-sm"
        />
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border p-1 w-full text-sm"
        />
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-1">MOQ</p>
        <input
          type="number"
          placeholder="Minimum Order Qty"
          value={moq}
          onChange={(e) => setMoq(e.target.value)}
          className="border p-1 w-full text-sm"
        />
      </div>

      <button
        onClick={applyFilter}
        className="w-full bg-blue-600 text-white py-2 rounded text-sm"
      >
        Apply Filter
      </button>
    </div>
  );
}
