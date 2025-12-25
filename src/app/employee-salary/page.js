"use client";
import { useEffect, useState } from "react";

export default function EmployeeSalary() {
  const [data, setData] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    date: "",
    type: "full",
    reason: "",
  });
  const [employeeId, setEmployeeId] = useState("");

useEffect(() => {
  const fetchSalary = async () => {
    const token = localStorage.getItem("emp_token");
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const res = await fetch(`/api/employee/salary?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    console.log("API Response Data:", result); // <<< ADD THIS LINE
    setData(result);

    const decoded = parseJwt(token);
    setEmployeeId(decoded.id);
  };

  fetchSalary();
}, []);
  const parseJwt = (token) => {
    if (!token) return {};
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const handleLeaveChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/employee/leave/apply", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' }, // Added Content-Type header
      body: JSON.stringify({ ...leaveForm, employeeId }),
    });
    const result = await res.json();
    if (result.success) {
      alert("Leave request submitted successfully. Awaiting approval.");
      setLeaveForm({ date: "", type: "full", reason: "" });
      // You might want to refetch salary data here after a successful leave application,
      // even though it won't change until the leave is approved.
      // Or, better yet, only refetch after an *approval* notification.
    } else {
      alert("Failed to submit leave: " + result.message); // Show error message from backend
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-8">
      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Your Salary Summary (Current Month)</h2> {/* Updated title */}
        <p>Base Salary: ₹{data.baseSalary}</p>
        <p>Approved Leaves: {data.totalLeaves}</p>
        <p className="text-red-600">Deduction: ₹{data.deduction.toFixed(2)}</p> {/* Made deduction red */}
        <p className="font-semibold text-green-700">Final Salary: ₹{data.finalSalary.toFixed(2)}</p> {/* Made final salary green */}
      </div>

      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <input
            type="date"
            name="date"
            className="w-full border p-2"
            value={leaveForm.date}
            onChange={handleLeaveChange}
            required
          />
          <select
            name="type"
            className="w-full border p-2"
            value={leaveForm.type}
            onChange={handleLeaveChange}
          >
            <option value="full">Full Day</option>
            <option value="half">Half Day</option>
          </select>
          <textarea
            name="reason"
            placeholder="Reason for leave"
            className="w-full border p-2"
            value={leaveForm.reason}
            onChange={handleLeaveChange}
            required
          ></textarea>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Leave Request
          </button>
        </form>
      </div>
    </div>
  );
}