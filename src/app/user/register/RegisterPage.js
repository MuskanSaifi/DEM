"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "react-select";
import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/app/store/userSlice";
import countryCodes from "../../../components/CountryCode";

  
export default function Register() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState(countryCodes[0]);
    const [mobileNumber, setMobileNumber] = useState("");
    const [pincode, setPincode] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // OTP Verification
    const [otp, setOtp] = useState("");
    const [loginnumber, setLoginnumber] = useState("");
    const [signup, setSignup] = useState(false);
const token = useSelector((state) => state.user.token);

    const dispatch = useDispatch();
    const router = useRouter();

       useEffect(() => {
        if (token) {
          router.push("/userdashboard"); // or '/' if you want to go to homepage
        }
      }, [token, router]);
    
    // Handle Registration Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const fullMobileNumber = `${countryCode.value}${mobileNumber}`; // ✅ FIXED
            const res = await fetch(`/api/auth/sendotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname, email, mobileNumber: fullMobileNumber, pincode, companyName }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setLoginnumber(fullMobileNumber);
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
    
    // Handle OTP Verification
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch(`/api/auth/verifyotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobileNumber: loginnumber, otp }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("OTP verified successfully!");
                   // Redux store update karen
                dispatch(setUser({ user: data.user, token: data.token }));
                router.push('/userdashboard');
                setSignup(false);
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
<h1 className="text-2xl font-bold mb-4">{signup ? "Verify OTP" : "Seller Register"}</h1>
                <Image
                src={"/assets/2-copy-0.png" || "/placeholder.png"}
                alt="login user"
                width={180}
                height={180}
                className="rounded object-cover mx-auto"
                priority={false}
                />


                {message && <p className="text-green-600">{message}</p>}
                {error && <p className="text-red-600">{error}</p>}

                {signup ? (
                    // OTP Verification Form
                    <form onSubmit={handleVerifyOtp}>
                        <div className="mb-2">
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
                ) : (
                    // Registration Form
                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
                            <input
                                type="text"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                required
                                className="w-full p-2 border rounded"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="mb-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-2 border rounded"
                                placeholder="Enter your email"
                            />
                        </div>

          {/* Mobile Number with Country Code */}
          <div className="mb-2">
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


                        <div className="mb-2">
                            <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                className="w-full p-2 border rounded"
                                placeholder="Enter your pincode"
                            />
                        </div>

                        <div className="mb-2">
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                                className="w-full p-2 border rounded"
                                placeholder="Enter your company name"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>
                )}
                <div className="mt-2">
                    <Link href="/user/login">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
}
