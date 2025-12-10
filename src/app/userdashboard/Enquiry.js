"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const Enquiry = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show one lead per page

  const user = useSelector((state) => state.user.user); // Get user from Redux store

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const currentUser = user || JSON.parse(localStorage.getItem("user"));
        const userId = currentUser?._id;

        if (!userId) {
          console.error("User ID not found. Cannot fetch enquiries.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`/api/userprofile/leadandwnquiry/recieveenquiry/${userId}`);
        setRequests(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests", error);
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  // Pagination logic
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openWhatsAppChat = (buyerPhoneNumber, buyerName, productName) => {
    if (buyerPhoneNumber) {
      const cleanedPhoneNumber = buyerPhoneNumber.replace(/\D/g, '');
      const whatsappNumber = cleanedPhoneNumber.startsWith('91') ? cleanedPhoneNumber : `91${cleanedPhoneNumber}`;
      const sellerName = user?.fullname || "Seller";
      const message = `Hey ${buyerName || 'there'}, regarding your inquiry for "${productName || 'a product'}". I am ${sellerName}. How can I assist you further?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      console.warn("Phone number not available for WhatsApp chat.");
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const currentUser = user || JSON.parse(localStorage.getItem("user"));
      const userId = currentUser?._id;

      if (!userId) {
        console.error("User ID not found. Cannot update enquiry status.");
        return;
      }

      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );

      const response = await axios.patch(`/api/userprofile/leadandwnquiry/recieveenquiry/${userId}`, {
        requestId: requestId,
        status: newStatus,
      });

      if (response.data.success) {
        console.log("Status updated successfully:", response.data.data);
      } else {
        setRequests(prevRequests =>
          prevRequests.map(req =>
            req._id === requestId ? { ...req, status: req.status } : req
          )
        );
        console.error("Failed to update status:", response.data.message);
        alert(`Failed to update status: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status: req.status } : req
        )
      );
      alert("Network error or server issue while updating status. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="text-center text-lg font-semibold text-blue-600 mb-6">
        Total Leads: <span className="text-lg  text-blue-800">{requests.length}</span>
      </div>
      {requests.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No enquiries found. Please try again later.</p>
      ) : (
        <>
          {/* Desktop/Tablet View - Standard Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-blue-500 text-white text-sm uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Buyer Name</th>
                  <th className="px-6 py-3 text-left">Call Buyer</th>
                  <th className="px-6 py-3 text-left">Product Name</th>
                  <th className="px-6 py-3 text-left">Quantity</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Chat via WhatsApp</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                  <th className="px-6 py-3 text-left">Date & Time</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-100 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-medium">{req?.buyer?.fullname || "N/A"}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {req?.buyer?.mobileNumber ? (
                        <a
                          href={`tel:${req.buyer.mobileNumber}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {req.buyer.mobileNumber}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{req?.product?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {req.quantity}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={`px-3 py-2 text-xs rounded-lg ${req.status === 'Pending' ? 'bg-yellow-500 text-white' : req.status === 'Completed' ? 'bg-green-500 text-white' : req.status === 'Responded' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {req?.buyer?.mobileNumber ? (
                        <button
                          onClick={() => openWhatsAppChat(
                            req.buyer.mobileNumber,
                            req.buyer.fullname,
                            req.product.name
                          )}
                          className="bg-green-500 w-full hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs flex items-center justify-center space-x-1 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.595-3.844-1.595-5.996 0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12c-1.936 0-3.803-.557-5.457-1.631l-6.096 1.629zm7.185-4.475l-.337-.202c-1.205-.722-1.944-2.023-1.944-3.486 0-1.851.983-3.473 2.585-4.406l.337-.202.164-.099c.928-.558 2.01-.868 3.12-.868 3.037 0 5.501 2.464 5.501 5.501s-2.464 5.501-5.501 5.501c-1.282 0-2.5-.436-3.486-1.196zm-.008-8.15c-.417-.251-.892-.387-1.385-.387-1.423 0-2.585 1.162-2.585 2.585 0 .616.216 1.191.595 1.658l.099.125.125.156c.493.616 1.209 1.053 2.001 1.053 1.423 0 2.585-1.162 2.585-2.585 0-.583-.205-1.127-.563-1.554l-.099-.125-.125-.156z"/>
                          </svg>
                          <span>Chat with {req.buyer.fullname}</span>
                        </button>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                        className="border w-full border-gray-300 rounded-md p-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Responded">Responded</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  <td className="px-6 py-4 text-sm font-medium">
  {new Date(req.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(",", "")}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* Mobile View - Card Layout */}
          <div className="md:hidden">
            {currentRequests.map((req) => (
              <div key={req._id} className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-gray-200">
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Buyer Name:</span>{' '}
                  <span className="text-sm text-gray-900">{req?.buyer?.fullname || "N/A"}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Call Buyer:</span>{' '}
                  {req?.buyer?.mobileNumber ? (
                    <a
                      href={`tel:${req.buyer.mobileNumber}`}
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      {req.buyer.mobileNumber}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-900">N/A</span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Product Name:</span>{' '}
                  <span className="text-sm text-gray-900">{req?.product?.name || "N/A"}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Quantity:</span>{' '}
                  <span className="text-sm text-gray-900">{req.quantity}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Status:</span>{' '}
                  <span className={`px-3 py-1 text-xs rounded-lg font-medium ${req.status === 'Pending' ? 'bg-yellow-500 text-white' : req.status === 'Completed' ? 'bg-green-500 text-white' : req.status === 'Responded' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                    {req.status}
                  </span>
                </div>
         
                <div  className="mb-2">
                  <span className="font-semibold text-gray-700">Update Status:</span>{' '}
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                    className="border w-full border-gray-300 rounded-md p-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Responded">Responded</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                 <div className="mb-2">
                  <span className="font-semibold text-gray-700">Date & Time:</span>{' '}
                 <span className="text-sm text-gray-900">
  {new Date(req.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // use 24-hour format
  })}
</span>

                </div>
                       <div>
                  {req?.buyer?.mobileNumber ? (
                    <button
                      onClick={() => openWhatsAppChat(
                        req.buyer.mobileNumber,
                        req.buyer.fullname,
                        req.product.name
                      )}
                      className="bg-green-500 w-full hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.595-3.844-1.595-5.996 0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12c-1.936 0-3.803-.557-5.457-1.631l-6.096 1.629zm7.185-4.475l-.337-.202c-1.205-.722-1.944-2.023-1.944-3.486 0-1.851.983-3.473 2.585-4.406l.337-.202.164-.099c.928-.558 2.01-.868 3.12-.868 3.037 0 5.501 2.464 5.501 5.501s-2.464 5.501-5.501 5.501c-1.282 0-2.5-.436-3.486-1.196zm-.008-8.15c-.417-.251-.892-.387-1.385-.387-1.423 0-2.585 1.162-2.585 2.585 0 .616.216 1.191.595 1.658l.099.125.125.156c.493.616 1.209 1.053 2.001 1.053 1.423 0 2.585-1.162 2.585-2.585 0-.583-.205-1.127-.563-1.554l-.099-.125-.125-.156z"/>
                      </svg>
                      <span>Chat with {req.buyer.fullname}</span>
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">N/A</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination Controls */}
<div className="flex justify-center mt-6 space-x-4">
  <button
    onClick={handlePrevPage}
    disabled={currentPage === 1}
    className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 cursor-pointer disabled:opacity-50"
  >
    Back
  </button>
  <span className="text-sm font-medium self-center"> {/* Added self-center here */}
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={handleNextPage}
    disabled={currentPage === totalPages}
    className="px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 cursor-pointer disabled:opacity-50"
  >
    Next
  </button>
</div>
    </div>
  );
};

export default Enquiry;