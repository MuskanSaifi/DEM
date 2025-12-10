"use client";
import { useState } from "react";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/employee/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("emp_token", data.token);
      alert("Login successful");
    } else {
      alert("Invalid login");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Employee Login</h2>
      <input type="email" placeholder="Email" required className="w-full border p-2 mb-2"
        value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" required className="w-full border p-2 mb-4"
        value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">Login</button>
    </form>
  );
}
