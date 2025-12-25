"use client";
import React, { useEffect, useState } from "react";

const Block = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/block")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBlockedUsers(data.blockedSellers);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blocked users:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading blocked users...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Blocked Sellers Records</h2>
      {blockedUsers.length === 0 ? (
        <p>No blocked sellers found.</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Blocked By</th>
              <th className="px-4 py-2 border">Blocked Seller</th>
              <th className="px-4 py-2 border">Seller Email</th>
              <th className="px-4 py-2 border">Seller Mobile</th>
              <th className="px-4 py-2 border">Company</th>
              <th className="px-4 py-2 border">Blocked At</th>
            </tr>
          </thead>
          <tbody>
            {blockedUsers.map((record, index) => {
              const blocker = record.blockedByUser || record.blockedByBuyer;

              // ✅ Determine if it's User or Buyer
              const isUser = !!record.blockedByUser;
              const blockerType = isUser ? "User" : "Buyer";
              const badgeColor = isUser
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800";

              return (
                <tr key={record._id} className="text-center">
                  <td className="px-4 py-2 border">{index + 1}</td>

                  {/* Blocked By */}
                  <td className="px-4 py-2 border">
                    <span className="font-semibold text-sm block">
                      {blocker?.fullname || "N/A"}
                    </span>
                    <small className="text-gray-500 block">
                      {blocker?.email || blocker?.mobileNumber || "N/A"}
                    </small>
                    <small
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${badgeColor}`}
                    >
                      {blockerType}
                    </small>
                  </td>

                  {/* Blocked Seller */}
                  <td className="px-4 py-2 border">
                    {record.sellerId?.fullname || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {record.sellerId?.email || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {record.sellerId?.mobileNumber || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {record.sellerId?.companyName || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Block;
