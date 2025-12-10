"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Import useRouter

const AdminLoginModal = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const router = useRouter(); // Router for navigation

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/admin/login", credentials);
      if (res.data.success) {
        toast.success("Login Successful!");
        router.push("/dashboard"); // Navigate instead of reloading
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Login Failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
<div className="card p-4 shadow-lg w-full sm:w-[350px]">
        <h3 className="text-center mb-3">Admin Login</h3>

        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLoginModal;
