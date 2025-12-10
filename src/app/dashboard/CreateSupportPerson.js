import React, { useEffect } from 'react'
import { useState } from "react";
import toast from 'react-hot-toast';
import Select from 'react-select';
import Swal from 'sweetalert2';

import { differenceInCalendarDays } from 'date-fns';
import SupportMemberModal from "./components/SupportMemberModal"; // adjust path
import axios from 'axios';

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const CreateSupportPerson = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", number:"" });
  const [message, setMessage] = useState("");
  const [stateupdate, setStateupdate] = useState(false);
  const [supportMembers, setSupportMembers] = useState([]);
  const [allClients, setAllClients] = useState([]); // instead of undefined
  const [selectedClients, setSelectedClients] = useState({}); // key: member._id, value: [user ids]
  const [loading, setLoading] = useState(true);
const [showPassword, setShowPassword] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const openModal = (member) => {
  setSelectedMember(member);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedMember(null);
};

const handleModalSave = async (id, updatedData) => {
  try {
    console.log("Sending PATCH to", `/api/adminprofile/supportmembers/${id}`, updatedData);
    const res = await axios.patch(`/api/adminprofile/supportmembers/${id}`, updatedData);

    if (res.data?.success) {
      toast.success("Support member updated!");
      closeModal();
      setStateupdate(prev => !prev);
    } else {
      console.error("API responded with error", res.data);
      toast.error("Update failed: " + (res.data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Request failed:", err.response?.data || err.message);
    toast.error("Update failed: " + (err.response?.data?.message || err.message));
  }
};


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/adminprofile/supportmembers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Support person created successfully!");
        setStateupdate(prev => !prev); // toggles value on each change
        setFormData({ name: "", email: "", password: "", number:"" }); // reset form
      } else {
        setMessage(`❌ Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setMessage("❌ Internal error, try again.");
    }
  };


 useEffect(() => {
    const fetchSupportMembers = async () => {
      try {
        const res = await fetch('/api/adminprofile/supportmembers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success) {
          setSupportMembers(data.members);
  
          // Build selectedClients object with pre-filled values
          const selected = {};
          data.members.forEach(member => {
            selected[member._id] = member.clients.map(client => ({
              value: client._id,
              label: client.fullname || client.name || client.email, // fallback
            }));
          });
          setSelectedClients(selected);
        }
      } catch (err) {
        console.error('Error fetching support members:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSupportMembers();
  }, [stateupdate]);
  
 useEffect(() => {
      const fetchAllClients = async () => {
        try {
          const res = await fetch('/api/adminprofile/supportmembers/clients');
          const data = await res.json();
          if (data.success) {
            setAllClients(data.users); 
          }
        } catch (error) {
          console.error('Error fetching clients:', error);
        }
      };
    
      fetchAllClients();
    }, []);
    
  const handleClientChange = (selectedOptions, memberId) => {
      setSelectedClients(prev => ({
        ...prev,
        [memberId]: selectedOptions
      }));
    };
    
const handleClientUpdate = async (memberId) => {
  const result = await Swal.fire({
    title: 'Save changes?',
    text: "Do you want to assign the selected clients?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, save it!',
  });

  if (result.isConfirmed) {
    const selected = selectedClients[memberId] || [];
    try {
      const res = await fetch(`/api/adminprofile/supportmembers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supportPersonId: memberId,
          clientIds: selected.map(opt => opt.value),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Clients assigned successfully');
        setStateupdate(prev => !prev);
      } else {
        toast.error(data.message || 'Failed to assign clients');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Internal server error');
    }
  }
};

    
  
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This action is irreversible. The support person will be permanently deleted.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch('/api/adminprofile/supportmembers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        setStateupdate(prev => !prev);
        toast.success('Successfully Deleted');
      } else {
        toast.error('Delete failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Internal server error');
    }
  }
};

  
    
return (
<>
<div className="flex flex-col lg:flex-row gap-6 p-6">

  {/* Left: Form */}
  <div className="w-full lg:w-1/3">
      <h4 className="text-2xl font-bold mb-4 text-blue-700">Create Support Person</h4>
    <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg">
      
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 font-medium">Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-gray-700 font-medium">Phone Number</label>
        <input
          type="number"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="number"
          value={formData.number}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-gray-700 font-medium">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

    <div className="mb-4 relative">
  <label className="block mb-1 text-gray-700 font-medium">Password</label>

  <input
    type={showPassword ? "text" : "password"}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
    name="password"
    value={formData.password}
    onChange={handleChange}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-blue-600"
  >
    {showPassword ? (
      // 👁️ Eye open
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.38 1.221-1.049 2.343-1.958 3.271M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) : (
      // 🚫 Eye off
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .524-.135 1.018-.373 1.446M9.88 9.88l-2.829 2.829M4.12 4.12A10.969 10.969 0 0012 5c4.478 0 8.268 2.943 9.542 7-.38 1.221-1.049 2.343-1.958 3.271M15 12a3 3 0 01-3 3" />
      </svg>
    )}
  </button>
</div>


      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        ➕ Create
      </button>

      {message && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">{message}</div>
      )}
    </form>
  </div>

  {/* Right: Table */}
  <div className="w-full lg:w-2/3">
    <h4 className="text-2xl font-bold mb-4 text-blue-700">📋 Assign Clients To Support Members</h4>

{loading ? (
  <div className="overflow-x-auto rounded-xl shadow-lg border border-blue-200 bg-white">
    <table className="min-w-full table-auto text-left">
      <thead className="bg-blue-100 text-blue-800 uppercase text-sm">
        <tr>
          <th className="px-6 py-3 border-b"><Skeleton width={20} /></th>
          <th className="px-6 py-3 border-b"><Skeleton width={80} /></th>
          <th className="px-6 py-3 border-b"><Skeleton width={120} /></th>
          <th className="px-6 py-3 border-b"><Skeleton width={150} /></th>
          <th className="px-6 py-3 border-b"><Skeleton width={80} /></th>
        </tr>
      </thead>
      <tbody>
        {Array(5).fill().map((_, i) => (
          <tr key={i} className="hover:bg-blue-50 transition">
            <td className="px-6 py-3 border-b"><Skeleton width={20} /></td>
            <td className="px-6 py-3 border-b"><Skeleton width={80} /></td>
            <td className="px-6 py-3 border-b"><Skeleton width={120} /></td>
            <td className="px-6 py-3 border-b"><Skeleton height={35} /></td>
            <td className="px-6 py-3 border-b">
              <div className="flex gap-2">
                <Skeleton width={60} height={30} />
                <Skeleton width={60} height={30} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : supportMembers.length === 0 ? (

      <p className="text-gray-500">No support members found.</p>
    ) : (
      <div className="overflow-x-auto rounded-xl shadow-lg border border-blue-200 bg-white">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-blue-100 text-blue-800 uppercase text-sm">
            <tr>
              <th className="px-6 py-3 border-b">#</th>
              <th className="px-6 py-3 border-b">Name</th>
              <th className="px-6 py-3 border-b">Email</th>
              {/* <th className="px-6 py-3 border-b">Created At</th> */}
              <th className="px-6 py-3 border-b">Assign Client</th>
              <th className="px-6 py-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
          {supportMembers.map((member, index) => (
  <tr key={member._id} className="hover:bg-blue-50 transition">
    <td className="px-6 py-3 border-b font-medium text-gray-700">{index + 1}</td>
<td className="px-6 py-3 border-b text-blue-600 cursor-pointer hover:underline" onClick={() => openModal(member)}>
  {member.name}
</td>
    <td className="px-6 py-3 border-b text-blue-600">{member.email}</td>
    {/* <td className="px-6 py-3 border-b text-blue-600">
  {formatDateTime(member.createdAt)}
</td> */}
<td className="px-6 py-3 border-b text-blue-900">

  
<Select
  isMulti
  value={selectedClients[member._id] || []}
  onChange={(selectedOptions) => handleClientChange(selectedOptions, member._id)}
  options={
    allClients?.map(client => {
      const createdAt = new Date(client.createdAt);
      const daysAgo = differenceInCalendarDays(new Date(), createdAt);

      const formattedDate = createdAt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return {
        value: client._id,
        label: `${client.fullname} (${client.email}) (${formattedDate})`,
        daysAgo,
      };
    }) || []
  }
styles={{
  option: (provided, state) => {
    const daysAgo = state.data.daysAgo;
    let backgroundColor = 'white';
    let hoverColor = '#f1f5f9'; // soft hover

    if (daysAgo === 0) backgroundColor = '#fee2e2'; // light red for today
    else if (daysAgo === 1) backgroundColor = '#ffedd5'; // light orange
    else if (daysAgo === 2) backgroundColor = '#fef9c3'; // light yellow

    return {
      ...provided,
      backgroundColor: state.isFocused ? hoverColor : backgroundColor,
      color: '#1f2937', // dark gray text
      fontSize: '13px',
      padding: '10px 12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    };
  },
 
}}

/>


</td>

    <td className="px-6 py-3 border-b text-blue-600">
<div className="flex gap-2">
  <button
    onClick={() => handleClientUpdate(member._id)}
    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-md shadow transition-all duration-200"
  >
    💾 Save
  </button>
  <button
    onClick={() => handleDelete(member._id)}
    className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded-md shadow transition-all duration-200"
  >
    🗑 Delete
  </button>

</div>

    </td>
  </tr>
))}

          </tbody>
        </table>

        <SupportMemberModal
  isOpen={isModalOpen}
  member={selectedMember}
  onClose={closeModal}
  onSave={handleModalSave}
/>


      </div>
    )}
  </div>

</div>


    </>
  )
}

export default CreateSupportPerson