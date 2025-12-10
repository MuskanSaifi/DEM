"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setBuyer } from "@/app/store/buyerSlice"; // ✅ We'll create this below
import countryCodes from "../../../components/CountryCode";
import Link from "next/link";

export default function BuyerLogin() {
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { buyer, token } = useSelector((state) => state.buyer);

  useEffect(() => {
    if (buyer && token) {
      router.push("/buyerdashboard");
    }
  }, [buyer, token, router]);

  // ✅ Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/buyer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: countryCode.value,
          mobileNumber,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setShowOtpField(true);
      } else setError(data.error);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/buyer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: countryCode.value,
          mobileNumber,
          otp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(setBuyer({ buyer: data.buyer, token: data.token }));
        setMessage("Login successful!");
        router.push("/buyer/dashboard");
      } else setError(data.error);
    } catch {
      setError("Invalid OTP or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center m-5">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Buyer Login</h2>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!showOtpField ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Mobile Number:</label>
              <div className="flex items-center">
                <div className="w-44">
                  <Select
                    options={countryCodes}
                    value={countryCode}
                    onChange={setCountryCode}
                    className="w-full"
                    getOptionLabel={(e) => `${e.label}`}
                  />
                </div>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,10}$/.test(val)) setMobileNumber(val);
                  }}
                  required
                  className="w-full p-2 border rounded-r h-[42px]"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Enter OTP:</label>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={4}
                className="w-full p-2 border rounded"
                placeholder="Enter OTP"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
          <div className="mt-4">
          <Link href="/buyer/register">Don't have an account? Register here</Link>
          </div>
      </div>
    </div>
  );
}
