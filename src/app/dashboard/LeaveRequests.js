// components/LeaveRequests.jsx
"use client";
import React, { useEffect, useState } from "react";

export default function LeaveRequests() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const res = await fetch("/api/employee"); // Assuming this fetches all employees with their leaves
    if (!res.ok) {
        console.error("Failed to fetch employees:", res.status, await res.text());
        return;
    }
    const empList = await res.json();
    
    // Flatten all leaves, add employee context, and filter for pending
    const allPendingLeaves = empList.flatMap(emp =>
      emp.leaves.map(l => ({
        ...l,
        employeeName: emp.name,
        employeeId: emp._id,
        leaveId: l._id, // <<< Make sure this is correctly mapping l._id to leaveId
      }))
    ).filter(l => l.status === "pending");
    setData(allPendingLeaves);
  };

  const updateStatus = async (employeeId, leaveId, status) => { // Accept leaveId
    const res = await fetch("/api/employee/leave/status", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, leaveId, status }), // Send leaveId in the body
    });
    const result = await res.json();
    if (result.success) {
      alert(`Leave ${status} successfully. Salary details updated.`);
      fetchLeaves(); // Refresh list after update
    } else {
      alert(`Failed to update leave status: ${result.message}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pending Leave Requests</h2>
      {data.length === 0 ? (
        <p>No pending leave requests.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Reason</th>
                <th scope="col" className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.leaveId} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{l.employeeName}</td>
                  <td className="px-6 py-4">{new Date(l.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 capitalize">{l.type}</td>
                  <td className="px-6 py-4">{l.reason}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="font-medium text-green-600 hover:underline mr-4"
                      onClick={() => updateStatus(l.employeeId, l.leaveId, "approved")} // Pass leaveId
                    >
                      Approve
                    </button>
                    <button
                      className="font-medium text-red-600 hover:underline"
                      onClick={() => updateStatus(l.employeeId, l.leaveId, "rejected")} // Pass leaveId
                    >
                      Reject
                    </button>
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