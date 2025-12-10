"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BankDetails = () => {
  const [formData, setFormData] = useState({
    accountType: "",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    mobileLinked: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch Bank Details
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, user not authenticated");
          return;
        }

        const response = await axios.get(`api/userprofile/profile/bankdetails`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.data) {
          setFormData(response.data.data);
        } else {
          console.error("Error fetching bank details:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching bank details:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("User not authenticated");

      const response = await axios.patch(`/api/userprofile/profile/bankdetails`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Bank details updated successfully!");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating bank details:", error.response?.data?.message || error.message);
      alert("Failed to update bank details.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="shadow-lg p-4">
        <h2 className="title">Bank <span>Details</span></h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 shadow-lg rounded-4 border-0 bg-white">        
          <div className="mb-3">
            <label className="form-label fw-semibold">Account Type</label>
            <select className="form-select" name="accountType" value={formData.accountType} onChange={handleChange}>
              <option value="">Select Account Type</option>
              <option value="Saving">Saving</option>
              <option value="Current">Current</option>
            </select>
          </div>
        
          <div className="mb-3">
            <label className="form-label fw-semibold">Account Holder Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter full name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
            />
          </div>
        
          <div className="mb-3">
            <label className="form-label fw-semibold">Account Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter account number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
            />
          </div>
        
          <div className="mb-3">
            <label className="form-label fw-semibold">Confirm Account Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Re-enter account number"
              name="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={handleChange}
            />
          </div>
        
          <div className="mb-3">
            <label className="form-label fw-semibold">IFSC Code</label>
            <input
              type="text"
              className="form-control text-uppercase"
              placeholder="e.g. SBIN0001234"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
            />
          </div>
        
          <div className="mb-4">
            <label className="form-label fw-semibold">Mobile Linked to Account</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter mobile number"
              name="mobileLinked"
              value={formData.mobileLinked}
              onChange={handleChange}
            />
          </div>
        
          <div className="text-center">
            <button type="submit" className="p-2 common-das-btn w-100 fw-bold fs-5 shadow-sm">
              Save
            </button>
          </div>
        </form>
        
        )}
      </div>
    </div>
  );
};

export default BankDetails;
