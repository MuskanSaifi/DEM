"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "react-select";
import Image from "next/image";

import { useDispatch,  useSelector } from "react-redux";

import { setUser } from "@/app/store/userSlice";
import countryCodes from "../../../components/CountryCode";

  
export default function Login() {
    const [countryCode, setCountryCode] = useState(countryCodes[0]); // Default to India
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);
// const token = useSelector((state) => state.user.token);
const { user, token } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const router = useRouter();

useEffect(() => {
  if (token && user) {
    if (user.termsAccepted) {
      router.push("/userdashboard");   // ✅ Terms accepted → dashboard
    } else {
      router.push("/accept-terms");    // ❌ Not accepted → terms page
    }
  }
}, [token, user, router]);

    // Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const fullMobileNumber = `${countryCode.value}${mobileNumber}`; // Combine country code and mobile number

            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobileNumber: fullMobileNumber }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setShowOtpField(true);
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
        setMessage("");
        setError("");
        try {
            const fullMobileNumber = `${countryCode.value}${mobileNumber}`;
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobileNumber: fullMobileNumber, otp }),
            });
            const data = await res.json();
         if (res.ok) {
  setMessage("Login successful!");
  // Redux store update
  dispatch(setUser({ user: data.user, token: data.token }));

  if (data.user.termsAccepted) {
    router.push("/userdashboard");
  } else {
    router.push("/accept-terms"); // ✅ Terms page par bhejna
  }
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
                <h2 className="text-2xl font-bold mb-4 text-center">Seller Login </h2>
           <Image
  src={"/assets/2-copy-0.png" || "/placeholder.png"}
  alt="login user"
  width={180}
  height={180}
  className="rounded-md object-cover mx-auto block"
  priority={false}
/>
                {message && <p className="text-green-600">{message}</p>}
                {error && <p className="text-red-600">{error}</p>}

                {!showOtpField ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Mobile Number:</label>
                            <div className="flex items-center">
                                <div className="w-48 h-full">
                                    <Select
                                        options={countryCodes}
                                        value={countryCode}
                                        onChange={setCountryCode}
                                        className="w-full"
                                        getOptionLabel={(e) => `${e.label}`} // Show only Flag + Code
                                        filterOption={(option, input) =>
                                            option.data.name.toLowerCase().includes(input.toLowerCase()) ||
                                            option.data.value.includes(input)
                                        }
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "42px",
                                                minWidth: "100px",
                                                whiteSpace: "nowrap",
                                                borderRadius: "6px 0 0 6px",
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                whiteSpace: "nowrap",
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                        }}
                                    />
                                </div>
                            <input
    type="text"
    value={mobileNumber}
    onChange={(e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setMobileNumber(value);
        }
    }}
    required
    className="w-full p-2 border rounded-r h-[42px]"
    placeholder="Enter your mobile number"
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
                            {loading ? "Verifying OTP..." : "Verify OTP"}
                        </button>                        
                    </form>
                )}
                <div className="mt-4">
                    <Link href="/user/register">Don't have an account? Register here</Link>
                </div>
            </div>
        </div>
    );
}
