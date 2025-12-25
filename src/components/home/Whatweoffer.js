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
    icon: <FaHandshake className="text-3xl text-green-500" />,
    title: "Buyer Connect",
    description: "Seamless connection between buyers and your platform.",
  },
  {
    icon: <FaGift className="text-3xl text-pink-500" />,
    title: "Complimentary Deal",
    description: "Special offerings to enhance customer engagement.",
  },
  {
    icon: <FaHeadset className="text-3xl text-purple-500" />,
    title: "Customer Support Person",
    description: "Dedicated support to solve all your queries promptly.",
  },
  {
    icon: <FaSearch className="text-3xl text-blue-500" />,
    title: "Digital Marketing Services",
    description: "Maximize search visibility and attract the right audience.",
  },
  {
    icon: <FaCode className="text-3xl text-orange-500" />,
    title: "Web Development",
    description: "Custom-built web solutions tailored to your business.",
  },
  {
    icon: <FaDatabase className="text-3xl text-teal-500" />,
    title: "CMS",
    description: "Easily manage your website content with robust systems.",
  },
];

const WhatWeOffer = () => {
  return (
    <section className="py-16 px-4 md:px-20 bg-white relative z-10">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row items-center gap-12 mb-12 text-center lg:text-left">
        <div className="w-full ">
          <p className="text-sm text-gray-400 tracking-widest uppercase">
            Why Choose Us
          </p>
          <h2 className="text-4xl font-bold text-gray-800 mt-2">
            What We Offer
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-indigo-100 transition-shadow text-center"
          >
            <div className="flex justify-center mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatWeOffer;
