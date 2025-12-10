"use client";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast"; // optional for notifications

const Userprofile = () => {
  const [userdetail, setUserdetail] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    if (token) userdata();
  }, [token]);

  const userdata = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/userprofile/profile/userprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserdetail(response.data.user);
      setFormData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleDeleteAccount2 = () => {
  toast.success("Your query for account deactivation has been raised. The team will take action soon.");
};

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.patch(`/api/userprofile/profile/userprofile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setUserdetail(response.data.user);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving user data:", error.response?.data || error.message);
    } finally {
      setSaving(false);
    }
  };

  // Add this function inside your component
const handleDeleteAccount = async () => {
  if (confirm("Are you sure? This will permanently delete your account and all data.")) {
    try {
      const res = await axios.delete(`/api/userprofile/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(res.data.message || "Account deleted successfully");
      // logout user and redirect
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  }
};

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, icon: reader.result }); // base64
    };
    if (file) reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-lg">Loading user details...</p>
      </div>
    );
  }

  if (!userdetail) {
    return <p className="text-center mt-10 text-red-500">User not found</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl border border-gray-200 transition-all hover:shadow-lg">
        {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 mb-4 bg-white rounded-lg shadow-md border border-gray-200">
  {/* Profile Image and Upload */}
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
          {userdetail.fullname?.charAt(0).toUpperCase()}
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
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{userdetail.fullname}</h2>
      <p className="text-gray-500 text-sm">{userdetail.companyName || "Company not set"}</p>
    </div>
  </div>

  {/* Profile Link */}
  <div className="mt-4 sm:mt-0">
    <Link
      href={userdetail.userProfileSlug ? `/company/${userdetail.userProfileSlug}` : "#"}
      className="text-xs sm:text-sm bg-blue-100 text-blue-700 font-medium px-4 py-2 rounded-full shadow-sm hover:bg-blue-200 transition"
    >
      {userdetail.userProfileSlug
        ? `dialexportmart.com/company/${userdetail.userProfileSlug}`
        : "Complete profile to generate your website"}
    </Link>
  </div>


</div>

        {/* Personal Details */}
        <div className="border p-4 rounded-lg shadow-sm bg-gray-50 mt-4">
          <h3 className="text-xl font-semibold mb-3 text-blue-700">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Email", name: "email" },
              { label: "Alternate Email", name: "alternateEmail" },
              { label: "Mobile No.", name: "mobileNumber" },
              { label: "Alternate Mobile No.", name: "alternateMobileNumber" },
              { label: "WhatsApp Number", name: "whatsappNumber" },
              { label: "Company Name", name: "companyName" },
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
                  <p className="text-gray-900">{userdetail[name] || "N/A"}</p>
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
        className="px-5 d-none py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </button>
      <button
        className="px-5  py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        onClick={handleDeleteAccount2}
      >
        Raise Query for Deactivate
      </button>
    </>
  )}
</div>
      </div>
    </div>
  );
};

export default Userprofile;
