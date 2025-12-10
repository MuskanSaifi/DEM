"use client";
import React, { useEffect, useState } from "react";

export default function SalaryReport({ month, year }) {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const getSalary = async () => {
      setLoading(true);
      // This API needs to fetch aggregated data, which now comes from monthlySalaryDetails
      // The API route for this needs to be able to access all employees, likely an admin route.
      // Assuming this is still hitting the /api/employee/leave/monthly endpoint you provided earlier,
      // which I modified to read from monthlySalaryDetails in the previous turn.
      const res = await fetch(`/api/employee/leave/monthly?month=${month}&year=${year}`);
      const data = await res.json();
      setSalaries(data);
      setLoading(false);
    };
    getSalary();
  }, [month, year]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Salary Report for {month}/{year}
      </h2>

      {loading ? (
        <p>Loading salary data...</p>
      ) : salaries.length === 0 ? (
        <p>No salary data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left bg-white shadow-md rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Salary</th>
                <th className="p-2">Leaves</th>
                <th className="p-2">Deduction</th>
                <th className="p-2">Final Salary</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{formatCurrency(s.baseSalary)}</td>
                  <td className="p-2">{s.leaves}</td> {/* This is totalApprovedLeaves */}
                  <td className="p-2 text-red-600">{formatCurrency(s.totalDeduction)}</td>
                  <td className="p-2 font-semibold text-green-700">
                    {formatCurrency(s.finalSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}