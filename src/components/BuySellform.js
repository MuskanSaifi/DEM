"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import toast from "react-hot-toast";
import Image from "next/image";

import { useDispatch } from "react-redux";
import { setUser } from "@/app/store/userSlice";
import { setBuyer } from "@/app/store/buyerSlice";

import countryCodes from "./CountryCode";

const BuySellForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [buySell, setBuySell] = useState("buy");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [productname, setProductname] = useState(""); // 🆕 Added
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 9000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const fullMobileNumber = `${countryCode.value}${mobileNumber.replace(/\s/g, "")}`;
      const apiUrl = buySell === "buy" ? "/api/buyer/sendotp" : "/api/auth/sendotp";
      const requestBody = {
        fullname,
        email,
        mobileNumber: fullMobileNumber,
        countryCode: countryCode.value,
      };

         if (buySell === "sell") {
        requestBody.companyName = companyName;
        requestBody.pincode = pincode;
      } else {
        requestBody.productname = productname; // 🆕 Added for Buyer
      }


      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setOtpSent(true);
      } else {
        setError(data.error || "Unexpected error occurred.");
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const fullMobileNumber = `${countryCode.value}${mobileNumber.replace(/\s/g, "")}`;
      const apiUrl = buySell === "buy" ? "/api/buyer/verifyotp" : "/api/auth/verifyotp";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: fullMobileNumber, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("OTP verified successfully!");

        if (buySell === "sell") {
          toast.success("Seller verified!");
          dispatch(setUser({ user: data.user, token: data.token }));
          router.push("/userdashboard");
        } else {
          toast.success("Buyer verified!");
                  dispatch(setBuyer({ buyer: data.buyer, token: data.token }));
        }
        setShowModal(false);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Invalid OTP or something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`modal fade ${showModal ? "show d-block" : ""} bg-[rgba(0,0,0,0.5)]`}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content p-4">
            <div className="modal-header">
              <p className="modal-title fw-bold">Tell us what you need</p>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="row">
              <div className="col-md-6 d-flex align-items-center justify-content-center">
                <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] mt-3">
                  <Image src="/assets/pop1.jpeg" alt="App Store" fill className="object-contain" />
                </div>
              </div>

              <div className="col-md-6">
                <div className="modal-body">
                  {message && <p className="text-success">{message}</p>}
                  {error && <p className="text-danger">{error}</p>}

                  {otpSent ? (
                    <form onSubmit={handleOtpVerify}>
                      <div className="mb-3">
                        <input
                          type="number"
                          maxLength={4}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          className="form-control"
                          placeholder="Enter OTP"
                        />
                      </div>
                      <button type="submit" className="btn btn-success w-100" disabled={loading}>
                        {loading ? "Verifying OTP..." : "Verify OTP"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">I want to:</label>
                        <div>
                          <input
                            type="radio"
                            name="buy_sell"
                            value="buy"
                            className="form-check-input me-2"
                            checked={buySell === "buy"}
                            onChange={() => setBuySell("buy")}
                          />{" "}
                          Buy
                          <input
                            type="radio"
                            name="buy_sell"
                            value="sell"
                            className="form-check-input ms-3 me-2"
                            checked={buySell === "sell"}
                            onChange={() => setBuySell("sell")}
                          />{" "}
                          Sell
                        </div>
                      </div>

                      {/* Buyer fields always visible */}
                      <input
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        className="form-control mb-2"
                        placeholder="Full Name"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control mb-2"
                        placeholder="Email (optional)"
                      />
                      <div className="mb-2 d-flex">
                        <Select options={countryCodes} value={countryCode} onChange={setCountryCode} className="me-2" />
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,10}$/.test(value)) setMobileNumber(value);
                          }}
                          required
                          maxLength={10}
                          className="form-control"
                          placeholder="Mobile Number"
                        />
                      </div>

                          {/* 🆕 Buyer field: Product Name */}
                      {buySell === "buy" && (
                        <input
                          type="text"
                          value={productname}
                          onChange={(e) => setProductname(e.target.value)}
                          className="form-control mb-2"
                          placeholder="Interested Product"
                        />
                      )}

                      {/* Seller fields only for Sell */}
                      {buySell === "sell" && (
                        <>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="form-control mb-2"
                            placeholder="Company Name"
                          />
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            required
                            className="form-control mb-2"
                            placeholder="Pincode"
                          />
                        </>
                      )}
                      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuySellForm;
