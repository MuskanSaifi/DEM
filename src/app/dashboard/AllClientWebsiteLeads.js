import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AllClientWebsiteLeads = () => {
  const [groupedData, setGroupedData] = useState({});
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const result = await axios.get("api/ClientWebsiteData");

      const grouped = result.data.reduce((acc, curr) => {
        if (!acc[curr.websitename]) acc[curr.websitename] = [];
        acc[curr.websitename].push(curr);
        return acc;
      }, {});

      setGroupedData(grouped);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (website) => {
    setSelectedWebsite(website);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedWebsite(null);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-700">
        Client Website Leads
      </h1>

      {/* Website Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {loading
          ? Array(6)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl shadow bg-white border border-gray-200"
                >
                  <Skeleton height={25} width={`70%`} />
                </div>
              ))
          : Object.keys(groupedData).map((website) => (
              <div
                key={website}
                onClick={() => openModal(website)}
                className="cursor-pointer bg-white border border-gray-300 p-6 rounded-xl shadow hover:shadow-xl hover:border-indigo-500 transition-all duration-200 text-center"
              >
                <h2 className="text-lg font-semibold text-indigo-700">{website}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {groupedData[website].length} Leads
                </p>
              </div>
            ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedWebsite && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-7 relative">

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-3xl"
            >
              &times;
            </button>

            {/* Modal Title */}
            <h2 className="text-2xl font-bold text-indigo-700 text-center mb-4">
              Leads from{" "}
              <Link
                href={`https://${selectedWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600"
              >
                {selectedWebsite}
              </Link>
            </h2>

            {/* Scrollable List */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {[...groupedData[selectedWebsite]].reverse().map((lead) => (
                <div
                  key={lead._id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-all shadow-sm"
                >
                  {/* Date & Time */}
                  {lead.createdAt && (
                    <p className="text-xs text-gray-500 mb-2 text-right">
                      {new Date(lead.createdAt).toLocaleDateString()} •{" "}
                      {new Date(lead.createdAt).toLocaleTimeString()}
                    </p>
                  )}

                  {/* Name */}
                  {lead.name && (
                    <p className="text-lg font-semibold text-gray-800 mb-1">
                      {lead.name}
                    </p>
                  )}

                  {/* Email */}
                  {lead.email && (
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-envelope text-red-500"></i>
                      <a href={`mailto:${lead.email}`} className="hover:underline">
                        {lead.email}
                      </a>
                    </p>
                  )}

                  {/* Number */}
                  {lead.number && (
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-phone-alt text-green-600"></i>
                      <a href={`tel:${lead.number}`} className="hover:underline">
                        {lead.number}
                      </a>
                    </p>
                  )}

                  {/* Company */}
                  {lead.companyName && (
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-building text-blue-600"></i>
                      {lead.companyName}
                    </p>
                  )}

                  {/* Address */}
                  {lead.address && (
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-yellow-600"></i>
                      {lead.address}
                    </p>
                  )}

                  {/* Requirement */}
                  {lead.requirement && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <i className="fas fa-tasks text-purple-600"></i>
                      {lead.requirement}
                    </p>
                  )}
                </div>
              ))}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllClientWebsiteLeads;
