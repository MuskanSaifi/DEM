"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SupportPersonLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Logging in...");

    try {
      const res = await fetch("/api/adminprofile/supportmembers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Login failed");
        return;
      }

      const supportPerson = {
        name: data.supportPerson.name,
        email: data.supportPerson.email,
      };

      localStorage.setItem("support_person", JSON.stringify(supportPerson));

      toast.success("Login successful!");
      toast.dismiss(loadingToast);
      setTimeout(() => {
        router.push("/support-dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      toast.dismiss(loadingToast);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="container mx-auto flex justify-center items-center mt-5 mb-5 min-h-[500px]">
      <div className="shadow p-4 w-full max-w-md rounded-xl relative">
        <h3 className="text-center mb-4">Support Person Login</h3>
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          {/* Password + Eye Icon */}
          <div className="mb-3 relative">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />

            {/* Eye / Eye-Off Icon */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              {showPassword ? (
                // 👁️ Eye open icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.38 1.221-1.049 2.343-1.958 3.271M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                // 🚫 Eye off icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.477 10.477A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .524-.135 1.018-.373 1.446M9.88 9.88l-2.829 2.829M4.12 4.12A10.969 10.969 0 0012 5c4.478 0 8.268 2.943 9.542 7-.38 1.221-1.049 2.343-1.958 3.271M15 12a3 3 0 01-3 3"
                  />
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
