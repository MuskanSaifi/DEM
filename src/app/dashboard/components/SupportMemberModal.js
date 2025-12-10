import React, { useState, useEffect } from "react";

const SupportMemberModal = ({ member, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    allSellerAccess: false,
    allBuyerAccess: false,
    allContactAccess: false,
    allSubscribersAccess: false,
    allPaymentsAccess: false,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        allSellerAccess: member.allSellerAccess || false,
        allBuyerAccess: member.allBuyerAccess || false,
        allContactAccess: member.allContactAccess || false,
        allSubscribersAccess: member.allSubscribersAccess || false,
        allPaymentsAccess: member.allPaymentsAccess || false,
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    onSave(member._id, formData);
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Give Access to Support Member</h2>

        <label className="block mb-2">
          Name:
          <input
            className="w-full border p-2 rounded"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>

        <label className="block mb-2">
          Email:
          <input
            className="w-full border p-2 rounded"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {["allSellerAccess", "allBuyerAccess", "allContactAccess", "allSubscribersAccess", "allPaymentsAccess"].map(key => (
            <label key={key} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                name={key}
                checked={formData[key]}
                onChange={handleChange}
              />
              <span>{key}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
          <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SupportMemberModal;
