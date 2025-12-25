import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Image from "next/image";

const Supportperson = () => {
  const [supportPerson, setSupportPerson] = useState(undefined); // undefined means "loading"
  const [error, setError] = useState("");

  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    const fetchSupportPerson = async () => {
      try {
        if (!token) {
          console.log("Token not available yet");
          return;
        }

        const response = await axios.get("/api/userprofile/profile/supportperson", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);
        setSupportPerson(response.data.supportperson); // could be null
      } catch (err) {
        console.error("Axios Error:", err);
        setError(err.response?.data?.message || "Failed to fetch support person");
        setSupportPerson(null); // prevent infinite loading
      }
    };

    fetchSupportPerson();
  }, [token]);

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600 font-medium">
        Error: {error}
      </div>
    );
  }

  if (supportPerson === undefined) {
    return (
      <div className="text-center mt-10 text-gray-600 font-medium">
        Loading...
      </div>
    );
  }

  if (supportPerson === null) {
    return (
      <div className="text-center mt-10 text-yellow-600 font-semibold">
        No Support Person Assigned Yet
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 mb-8 bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 border border-blue-200">
    {/* Left: Image */}
    <div className="w-full md:w-1/3 flex justify-center">
      <Image
        src="/assets/support-1.png"
        alt="Support Person"
        width={400}
        height={400}
        className="rounded-xl border-4 border-white shadow-lg"
      />
    </div>
  
    {/* Right: Info */}
    <div className="w-full md:w-2/3 bg-white p-6 md:p-8 rounded-2xl shadow-inner border border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
     Support Person Info
      </h2>
  
      <p className="text-sm md:text-base text-gray-600 mb-5 leading-relaxed">
        Our support team is here to help you succeed. Whether it’s about memberships, package upgrades, technical difficulties, or payment concerns—share your issue, and we’ll take care of the rest swiftly and professionally.
      </p>
  
      <div className="space-y-2 text-gray-700 text-sm md:text-base">
        <p>
          <span className="font-semibold">👤 Name:</span> {supportPerson.name}
        </p>
        <p>
          <span className="font-semibold">📧 Email:</span> {supportPerson.email}
        </p>
        <p>
          <span className="font-semibold">📞 Contact No:</span> {supportPerson.number}
        </p>
      </div>
    </div>
  </div>
  
  );
};

export default Supportperson;
