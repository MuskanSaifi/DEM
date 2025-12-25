"use client";
import React, { useEffect, useState } from "react";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/report")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReports(data.reports);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading reports...</p>;
return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Seller Reports</h2>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Reported By</th>
              <th className="px-4 py-2 border">Reported Seller</th>
              <th className="px-4 py-2 border">Reason</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Reported At</th>
            </tr>
          </thead>
          <tbody>
        {reports.map((report, index) => {
  // ✅ Identify if reporter is a User or Buyer
  const isUser = report.reportedByModel === "User";

  const reporterName =
    report.reportedBy?.fullname ||
    report.reportedBy?.name ||
    report.reportedBy?.mobileNumber ||
    "N/A";

  const reporterIdentifier = isUser
    ? report.reportedBy?.email
    : report.reportedBy?.mobileNumber;

  const reporterType = isUser ? "User" : "Buyer";

  return (
    <tr key={report._id} className="text-center">
      <td className="px-4 py-2 border">{index + 1}</td>

      {/* Reported By */}
      <td className="px-4 py-2 border">
        <span className="font-semibold text-sm block">
          {reporterName || "N/A"}
        </span>
        <small className="text-gray-500 block">
          {reporterIdentifier || "N/A"}
        </small>
        <small
          className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block 
          ${isUser ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
        >
          {reporterType}
        </small>
      </td>

      {/* Reported Seller */}
      <td className="px-4 py-2 border">
        {report.sellerId?.fullname || "N/A"}
        <br />
        <small className="text-gray-500">
          {report.sellerId?.companyName}
        </small>
      </td>

      <td className="px-4 py-2 border">{report.reason}</td>
      <td className="px-4 py-2 border">{report.status}</td>
      <td className="px-4 py-2 border">
        {new Date(report.createdAt).toLocaleString()}
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

export default Report;