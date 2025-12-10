'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LeadsEnquiry = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('/api/admin/leadandwnquiry');
        const data = await res.json();
        if (data.success) {
          setLeads(data.data.reverse());
        }
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const openModal = (type, data) => {
    setModalType(type);
    setSelectedInfo(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInfo(null);
    setModalType('');
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead?.buyer?.fullname?.toLowerCase().includes(term) ||
      lead?.buyer?.mobileNumber?.toLowerCase().includes(term) ||
      lead?.seller?.fullname?.toLowerCase().includes(term) ||
      lead?.seller?.mobileNumber?.toLowerCase().includes(term) ||
      lead?.product?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-indigo-600 mb-4">Leads Enquiry</h2>

      {/* Search Bar */}
      <div className="sticky top-0 z-10">
        <input
          type="text"
          placeholder="Search by seller/buyer name, phone or product name..."
          className="w-full border shadow border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-5 border rounded-xl shadow">
              <Skeleton height={20} width="30%" className="mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Skeleton height={80} />
                <Skeleton height={80} />
                <Skeleton height={80} />
              </div>
              <Skeleton height={15} className="mb-1" count={4} />
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center text-gray-500">No leads found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLeads.map((lead, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 transition hover:scale-[1.02]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div
                  onClick={() => openModal('Buyer', lead.buyer)}
                  className="cursor-pointer bg-gradient-to-r from-indigo-100 to-indigo-300 p-4 rounded-lg shadow-inner text-center hover:ring-2 hover:ring-indigo-400"
                >
                  <h4 className="text-indigo-800 font-semibold mb-1">Buyer</h4>
                  <p className="text-indigo-900 text-sm mb-0">{lead.buyer?.fullname || 'N/A'}</p>
                  <p className="text-indigo-900 text-sm mb-0">{lead.buyer?.mobileNumber || 'N/A'}</p>
                </div>
                <div
                  onClick={() => openModal('Seller', lead.seller)}
                  className="cursor-pointer bg-gradient-to-r from-pink-100 to-pink-300 p-4 rounded-lg shadow-inner text-center hover:ring-2 hover:ring-pink-400"
                >
                  <h4 className="text-pink-800 font-semibold mb-1">Seller</h4>
                  <p className="text-pink-900 text-sm mb-0">{lead.seller?.fullname || 'N/A'}</p>
                  <p className="text-pink-900 text-sm mb-0">{lead.seller?.mobileNumber || 'N/A'}</p>
                </div>
                <div
                  onClick={() => openModal('Product', lead.product)}
                  className="cursor-pointer bg-gradient-to-r from-blue-100 to-blue-300 p-4 rounded-lg shadow-inner text-center hover:ring-2 hover:ring-blue-400"
                >
                  <h4 className="text-blue-800 font-semibold mb-1">Product</h4>
                  <p className="text-blue-900 text-sm mb-0">{lead.product?.name || 'N/A'}</p>
                </div>
              </div>

              <p><span className="font-semibold">Quantity:</span> {lead.quantity}</p>
              <p><span className="font-semibold">Unit:</span> {lead.unit}</p>
              <p>
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 px-2 py-1 text-sm rounded-full ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </p>
              <p><span className="font-semibold">Requirement Frequency:</span> {lead.requirementFrequency}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Code */}
      {modalOpen && selectedInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-center mb-4">{modalType} Details</h3>

            <div className="space-y-2 text-sm text-gray-700 max-h-60 overflow-y-auto">
              {modalType === 'Buyer' && (
                <>
                  <div><strong>Full Name:</strong> {selectedInfo?.fullname || 'N/A'}</div>
                  <div><strong>Mobile Number:</strong> {selectedInfo?.mobileNumber || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedInfo?.email || 'N/A'}</div>
                  <div><strong>Company Name:</strong> {selectedInfo?.companyName || 'N/A'}</div>
                </>
              )}

              {modalType === 'Seller' && (
                <>
                  <div>
                    <strong>Seller Profile:</strong>{' '}
                    {selectedInfo?.userProfileSlug ? (
                      <Link
                        href={`http://dialexportmart.com/company/${selectedInfo.userProfileSlug}`}
                        className="text-blue-600 underline"
                        target="_blank"
                      >
                        {selectedInfo.userProfileSlug}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div><strong>Full Name:</strong> {selectedInfo?.fullname || 'N/A'}</div>
                  <div><strong>Mobile Number:</strong> {selectedInfo?.mobileNumber || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedInfo?.email || 'N/A'}</div>
                  <div><strong>Location:</strong> {selectedInfo?.location || 'N/A'}</div>
                </>
              )}

              {modalType === 'Product' && (
                <>
                  {selectedInfo?.images?.[0]?.url && (
                    <div className="mb-3 relative w-[70px] h-[70px]">
                      <Image
                        src={selectedInfo.images[0].url}
                        alt={selectedInfo.name}
                        fill
                        className="rounded-md border object-contain"
                      />
                    </div>
                  )}
                  <div><strong>Name:</strong> {selectedInfo?.name || 'N/A'}</div>
                  <div><strong>Description:</strong> {selectedInfo?.description || 'N/A'}</div>
                  <div><strong>Price:</strong> ₹{selectedInfo?.price || 'N/A'}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsEnquiry;
