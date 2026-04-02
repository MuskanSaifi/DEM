"use client";
import React from "react";
import {
  FaSearch,
  FaCode,
  FaDatabase,
  FaHandshake,
  FaGift,
  FaHeadset,
} from "react-icons/fa";

const services = [
  {
    icon: <FaHandshake className="text-green-500 text-xl md:text-3xl" />,
    title: "Buyer Connect",
    description: "Connect directly with genuine B2B buyers and bulk importers",
  },
  {
    icon: <FaGift className="text-pink-500 text-xl md:text-3xl" />,
    title: "Complimentary Deal",
    description: "Special offerings to enhance customer engagement.",
  },
  {
    icon: <FaHeadset className="text-purple-500 text-xl md:text-3xl" />,
    title: "Customer Support",
    description: "Dedicated support for listings and inquiries.",
  },
  {
    icon: <FaSearch className="text-blue-500 text-xl md:text-3xl" />,
    title: "Digital Marketing",
    description: "Boost visibility and generate B2B leads.",
  },
  {
    icon: <FaCode className="text-orange-500 text-xl md:text-3xl" />,
    title: "Web Development",
    description: "Professional website solutions.",
  },
  {
    icon: <FaDatabase className="text-teal-500 text-xl md:text-3xl" />,
    title: "CMS",
    description: "Manage products and content easily.",
  },
];

const WhatWeOffer = () => {
  return (
    <section className="py-8 md:py-16 px-3 md:px-20 bg-white">
      
      {/* Heading */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-12 text-center lg:text-left">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800">
          Our B2B Services to Grow Your Business
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 max-w-7xl mx-auto">
        
        {services.map((service, index) => (
          <div
            key={index}
            className="
            bg-white 
            p-3 md:p-6 
            rounded-lg md:rounded-xl 
            shadow-sm md:shadow-md 
            hover:shadow-lg 
            transition 
            text-center"
          >
            {/* Icon */}
            <div className="flex justify-center mb-2 md:mb-4">
              {service.icon}
            </div>

            {/* Title */}
            <h3 className="text-xs md:text-xl font-semibold text-gray-800 mb-1 md:mb-2 leading-tight">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-[10px] md:text-sm text-gray-600 leading-tight">
              {service.description}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
};

export default WhatWeOffer;