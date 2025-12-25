"use client";
import { useState, useEffect } from "react";
import Select from "react-select";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setBuyer } from "@/app/store/buyerSlice";
import { useRouter } from "next/navigation";
import countryCodes from "../../../components/CountryCode";

export default function BuyerRegister() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [productname, setProductname] = useState("");
  const [otp, setOtp] = useState("");
  const [signup, setSignup] = useState(false);
  const [loginnumber, setLoginnumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.buyer.token);

  useEffect(() => {
    if (token) {
      router.push("/buyerdashboard");
    }
  }, [token, router]);

  // Send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/buyer/sendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           fullname,
            email,
             mobileNumber,
              countryCode: countryCode?.value,
               productname }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setLoginnumber(data.mobileNumber);
        setSignup(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/buyer/verifyotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: loginnumber, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("OTP verified successfully!");
        dispatch(setBuyer({ buyer: data.buyer, token: data.token }));
        router.push("/buyerdashboard");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Invalid OTP or something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center m-5">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">{signup ? "Verify OTP" : "Buyer Register"}</h1>
        <Image
          src={"/assets/2-copy-0.png"}
          alt="buyer register"
          width={180}
          height={180}
          className="rounded object-cover mx-auto"
        />
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
        {signup ? (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="Enter OTP"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Full Name"
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex mb-2">
              <div className="w-48">
                <Select
                  options={countryCodes}
                  value={countryCode}
                  onChange={setCountryCode}
                  getOptionLabel={(e) => `${e.label}`}
                  styles={{
                    control: (base) => ({ ...base, minHeight: "42px" }),
                  }}
                />
              </div>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) setMobileNumber(value);
                }}
                placeholder="Mobile Number"
                className="w-full p-2 border rounded-r"
                required
              />
            </div>

            <input
              type="text"
              value={productname}
              onChange={(e) => setProductname(e.target.value)}
              placeholder="Interested Product"
              className="w-full p-2 border rounded mb-2"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}
        <div className="mt-2">
          <Link href="/buyer/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}
