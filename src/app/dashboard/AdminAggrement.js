'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PDFAdminSideWrapper = dynamic(
  () => import('./components/PDFAdminSideWrapper'),
  { ssr: false, loading: () => <p className="text-center p-6 text-gray-500">Loading PDF module...</p> }
);

const AdminAggrement = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedAgreementId, setSelectedAgreementId] = useState(null);
  const [viewingAgreementId, setViewingAgreementId] = useState(null); // New state to track the PDF viewer

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/Aggrements/aggrements');
      if (!response.ok) {
        throw new Error('Failed to fetch agreements');
      }
      const result = await response.json();
      setAgreements(result.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load agreements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  useEffect(() => {
    if (selectedAgreementId) {
      const selectedAgreement = agreements.find(a => a._id === selectedAgreementId);
      if (selectedAgreement) {
        setFormData({
          date: selectedAgreement.date || new Date().getDate().toString(),
          month: selectedAgreement.month || new Date().toLocaleString('default', { month: 'long' }),
          year: selectedAgreement.year || new Date().getFullYear().toString(),
          serviceProviderAddress: selectedAgreement.serviceProviderAddress || "",
          clientName: selectedAgreement.clientName || "",
          companyAddress: selectedAgreement.companyAddress || "",
          email: selectedAgreement.email || "",
          phone: selectedAgreement.phone || "",
          serviceDetails: selectedAgreement.serviceDetails || "",
          startDate: selectedAgreement.startDate || "",
          endDate: selectedAgreement.endDate || "",
          paymentDate: selectedAgreement.paymentDate || "",
        });
      }
    }
  }, [selectedAgreementId, agreements]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleCreateAgreement = async (agreementId, data) => {
    const updateBody = {
      ...data,
      status: "created",
    };
    try {
      const response = await fetch(`/api/Aggrements/${agreementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error('Failed to create agreement.');
      }
      fetchAgreements();
      setSelectedAgreementId(null);
      setFormData({});
    } catch (err) {
      console.error('Update error:', err);
      setError('Could not finalize the agreement. Check the console for details.');
    }
  };

  const handleDownloadComplete = async (agreementId) => {
    try {
      const response = await fetch(`/api/Aggrements/${agreementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'downloaded',
          downloadedAt: new Date().toISOString()
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update agreement status.');
      }
      fetchAgreements();
    } catch (err) {
      console.error('Download update error:', err);
      setError('Could not update agreement status after download.');
    }
  };

  const formFields = [
    { label: "Day", name: "date", type: "number" },
    { label: "Month", name: "month", type: "text" },
    { label: "Year", name: "year", type: "number" },
    { label: "Service Provider Address", name: "serviceProviderAddress", type: "text" },
    { label: "Client Full Name", name: "clientName", type: "text" },
    { label: "Client Company Address", name: "companyAddress", type: "text" },
    { label: "Client Email", name: "email", type: "email" },
    { label: "Client Phone", name: "phone", type: "tel" },
    { label: "Service Details", name: "serviceDetails", type: "text" },
    { label: "Agreement Start Date", name: "startDate", type: "text" },
    { label: "Agreement End Date", name: "endDate", type: "text" },
    { label: "Payment Date", name: "paymentDate", type: "text" },
  ];

  const viewingAgreement = agreements.find(a => a._id === viewingAgreementId);

  if (loading) {
    return <div className="text-center p-6 text-gray-500">Loading agreements...</div>;
  }
  
  if (error) {
    return <div className="text-center p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center p-6 mt-5 bg-white shadow-xl rounded-2xl max-w-4xl mx-auto">
      <div className="w-full mb-8">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Pending Agreements</h4>
        {agreements.filter(a => a.status === "pending").length > 0 ? (
          <ul className="bg-white border rounded-xl divide-y">
            {agreements.filter(a => a.status === "pending").map(agreement => (
              <li key={agreement._id} className="p-4 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-2 sm:mb-0 text-center sm:text-left">
                  <p className="font-bold text-gray-800">Request from: {agreement.clientName}</p>
                  <p className="text-sm text-gray-500">Requested at: {new Date(agreement.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedAgreementId(agreement._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
                >
                  Create Agreement
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No pending agreement requests.</p>
        )}
      </div>

      {selectedAgreementId && (
        <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-2xl mb-8">
          <h4 className="text-xl font-semibold mb-4 text-blue-800">
            Create Agreement for User: {agreements.find(a => a._id === selectedAgreementId)?.clientName}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.label}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => handleCreateAgreement(selectedAgreementId, formData)}
            className="mt-6 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-semibold"
          >
            Finalize & Send Agreement
          </button>
        </div>
      )}

      {viewingAgreementId && viewingAgreement && (
        <div className="w-full p-6 bg-gray-100 border border-gray-300 rounded-2xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold text-gray-800">
              PDF View: {viewingAgreement.clientName}'s Agreement
            </h4>
            <button
              onClick={() => setViewingAgreementId(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
            >
              Close Viewer
            </button>
          </div>
          <PDFAdminSideWrapper agreement={viewingAgreement} isViewing={true} />
        </div>
      )}

      <div className="w-full">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">All Agreements</h4>

        {agreements.length > 0 ? (
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <div
                key={agreement._id}
                className="bg-white border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition"
              >
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{agreement.clientName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    📍 {agreement.companyAddress}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    📅 Payment Date: {agreement.paymentDate}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    📞 {agreement.phone}
                  </p>
                  <p className="text-sm text-gray-600">{agreement.serviceDetails}</p>
                  <p className="text-sm text-gray-600">Start Date: {agreement.startDate}</p>

                  <span
                    className={`inline-block px-3 py-1 mt-2 text-xs font-semibold rounded-full 
                      ${agreement.status === "downloaded"
                        ? "bg-green-100 text-green-700"
                        : agreement.status === "signed"
                        ? "bg-purple-100 text-purple-700"
                        : agreement.status === "created"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {agreement.status}
                  </span>
                </div>

                {agreement.status !== "pending" && (
                  <div className="mt-4 sm:mt-0 flex gap-2">
                    <button
                      onClick={() => setViewingAgreementId(agreement._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                    >
                      View PDF
                    </button>
                    <PDFAdminSideWrapper
                      agreement={agreement}
                      handleDownloadComplete={handleDownloadComplete}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No agreements to display.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAggrement;
