"use client";

import React, { useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import Image from 'next/image';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("/api/contact", formData);
  
      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: response.data.message,
        });
        setFormData({ name: "", email: "", phone: "", description: "" });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.messages?.join("\n") ||
        error.response?.data?.error ||
        "Something went wrong. Please try again later.";
  
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: errorMessage,
      });
    }
  };
  

  return (
    <>
      <div>
 <Image
  src="/assets/pagesbanner/Contact Us.png"
  alt="Blog Banner"
  layout="responsive"
  width={1000}
  height={450}
  className="rounded img-fluid common-shad img-cover"
  priority
/>

        </div>
      <section className="mt-5 mb-5">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Contact<span className="text-[#6D4AAF]"> Us</span>
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50 rounded-2xl shadow-md p-3">
            {/* Left Section */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">
                To make requests for further information,{" "}
                <span className="text-[#6D4AAF]">contact us</span> via our social
                channels.
              </h2>
              <p className="text-gray-600 text-sm">
                We just need a couple of hours! No more than 2 working days since
                receiving your issue ticket.
              </p>
              <h2 className="text-2xl font-bold mt-5 text-gray-800">
                <span className="text-gray-900">Branch Office</span>
              </h2>
              <p className="flex items-center gap-2 text-gray-600">
                <FaBuilding className="text-[#6D4AAF]" />{" "}
                <strong className="text-gray-800">Dial Export Mart</strong>
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-[#6D4AAF]" /> 30 N Gould St
                #3414, Sheridan, Wyoming - 82801, USA
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaPhone className="text-[#6D4AAF]" /> +1(570)-676-1540
              </p>
            </div>

            {/* Right Section */}
            <div className="flex justify-center items-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl w-full">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name *"
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#6D4AAF] outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email *"
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#6D4AAF] outline-none"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number *"
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#6D4AAF] outline-none"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please describe what you need."
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#6D4AAF] outline-none"
                    rows={5}
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-[#6D4AAF] text-white py-3 rounded-md text-lg font-semibold hover:bg-[#5c3e93] transition"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
