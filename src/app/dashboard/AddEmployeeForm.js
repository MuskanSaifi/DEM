"use client";
import { useState } from "react";

export default function AddEmployeeForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    baseSalary: "",
    doj: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/employee/add", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        baseSalary: parseFloat(form.baseSalary),
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Employee added successfully!");
      setForm({ name: "", email: "", position: "", baseSalary: "", doj: "", password: "" });
    } else {
      alert(data.message || "Failed to add employee");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl p-4 space-y-3 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Add New Employee</h2>

      <input
        name="name"
        type="text"
        placeholder="Full Name"
        className="w-full border p-2"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border p-2"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="position"
        type="text"
        placeholder="Position"
        className="w-full border p-2"
        value={form.position}
        onChange={handleChange}
        required
      />
      <input
        name="baseSalary"
        type="number"
        placeholder="Base Salary"
        className="w-full border p-2"
        value={form.baseSalary}
        onChange={handleChange}
        required
      />
      <input
        name="doj"
        type="date"
        placeholder="Date of Joining"
        className="w-full border p-2"
        value={form.doj}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Login Password"
        className="w-full border p-2"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Employee
      </button>
    </form>
  );
}
