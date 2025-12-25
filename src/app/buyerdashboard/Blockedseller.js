"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

const BlockedSellers = () => {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.buyer);

  const fetchBlocked = async () => {
    try {
      const res = await axios.get("/api/buyer/blocked-sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setBlocked(res.data.blockedList);
    } catch (err) {
      console.error("Error fetching blocked sellers:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      console.warn("⚠️ No buyer token found in Redux");
      return;
    }
    fetchBlocked();
  }, [token]);

  // 🗑️ Unblock function
  const handleUnblock = async (sellerId) => {
    if (!confirm("Are you sure you want to unblock this seller?")) return;
    try {
      const res = await axios.delete(`/api/buyer/blocked-sellers?sellerId=${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Seller unblocked successfully");
        setBlocked((prev) => prev.filter((item) => item.sellerId._id !== sellerId));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to unblock seller");
    }
  };

  if (loading) return <p className="p-4">Loading blocked sellers...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Blocked Sellers</h2>
      {blocked.length === 0 ? (
        <p className="text-gray-600">You haven’t blocked any sellers yet.</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Seller Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Mobile</th>
              <th className="px-4 py-2 border">Company</th>
              <th className="px-4 py-2 border">Blocked On</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {blocked.map((record, index) => (
              <tr key={record._id} className="text-center hover:bg-gray-50">
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{record.sellerId?.fullname || "N/A"}</td>
                <td className="px-4 py-2 border">{record.sellerId?.email || "N/A"}</td>
                <td className="px-4 py-2 border">{record.sellerId?.mobileNumber || "N/A"}</td>
                <td className="px-4 py-2 border">{record.sellerId?.companyName || "N/A"}</td>
                <td className="px-4 py-2 border">
                  {new Date(record.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleUnblock(record.sellerId._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Unblock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BlockedSellers;