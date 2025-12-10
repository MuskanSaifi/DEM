"use client";

import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { logoutBuyer } from "@/app/store/buyerSlice";

const BuyerProfile = () => {
  const [buyerDetail, setBuyerDetail] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = useSelector((state) => state.buyer.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) fetchBuyerData();
  }, [token]);

  const fetchBuyerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/buyer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuyerDetail(response.data.buyer);
      setFormData(response.data.buyer);
    } catch (error) {
      console.error("Error fetching buyer data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, icon: reader.result });
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.patch(`/api/buyer/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setBuyerDetail(response.data.buyer);
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving buyer data:", error.response?.data || error.message);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete("/api/buyer/delete", {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Your account has been deleted.", "success");
        dispatch(logoutBuyer());
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", "Failed to delete account.", "error");
      }
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-lg">Loading buyer details...</p>
      </div>
    );

  if (!buyerDetail) return <p className="text-center mt-10 text-red-500">Buyer not found</p>;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-all">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 mb-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {formData.icon ? (
                <img
                  src={formData.icon}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-400 shadow"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow ring-2 ring-blue-300">
                  {buyerDetail.fullname?.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload new image"
                />
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{buyerDetail.fullname}</h2>
              <p className="text-gray-500 text-sm">{buyerDetail.email || "Email not set"}</p>
            </div>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="border p-4 rounded-lg shadow-sm bg-gray-50 mt-4">
          <h3 className="text-xl font-semibold mb-3 text-blue-700">Buyer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name", name: "fullname" },
              { label: "Email", name: "email" },
              { label: "Mobile Number", name: "mobileNumber" },
              { label: "Product Interested", name: "productname" },
              { label: "Quantity", name: "quantity" },
              { label: "Unit", name: "unit" },
              { label: "Currency", name: "currency" },
            ].map(({ label, name }) => (
              <div key={name}>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                {editMode ? (
                  <input
                    type="text"
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-md px-3 py-2 transition-all"
                  />
                ) : (
                  <p className="text-gray-900">{buyerDetail[name] || "N/A"}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
          {editMode ? (
            <>
              <button
                className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Details"}
              </button>
            </>
          ) : (
            <>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={() => setEditMode(true)}
              >
                Edit Details
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
