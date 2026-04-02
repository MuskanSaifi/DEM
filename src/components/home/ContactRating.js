"use client";
import React from 'react';
import Image from 'next/image';
import { FaPhoneAlt, FaEnvelope, FaStar } from "react-icons/fa";

const ContactRating = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-20">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 
                      bg-white rounded-xl md:rounded-3xl 
                      shadow-sm overflow-hidden 
                      p-4 md:p-12">

        {/* Left Image */}
        <div className="relative w-full md:w-1/2 h-[200px] md:h-[500px]">
          <Image
            src="/assets/contact-girl.png"
            alt="Support Person"
            fill
            className="object-contain md:object-cover rounded-xl md:rounded-2xl"
            priority
          />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-3 md:space-y-6">

          {/* Rating */}
          <div className="text-2xl md:text-5xl font-extrabold text-gray-900">
            4.9/5.0
          </div>

          {/* Stars */}
          <div className="flex justify-center md:justify-start gap-1 text-yellow-500 text-lg md:text-3xl">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>

          {/* Text */}
          <p className="text-gray-600 text-xs md:text-lg">
            Rated by 700+ customers for 3200+ clients
          </p>

          {/* Call */}
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-gray-100 hover:bg-gray-200 transition">
            <FaPhoneAlt className="text-red-500 text-lg md:text-2xl" />
            <div className="text-left">
              <p className="text-[10px] md:text-sm font-semibold uppercase text-gray-600 mb-0">
                Call for advice
              </p>
              <a
                href="tel:+918448668076"
                className="text-blue-600 text-sm md:text-lg font-bold hover:underline"
              >
                +91 84486 68076
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-gray-100 hover:bg-gray-200 transition">
            <FaEnvelope className="text-green-500 text-lg md:text-2xl" />
            <div className="text-left">
              <p className="text-[10px] md:text-sm font-semibold uppercase text-gray-600 mb-0">
                Say hello
              </p>
              <a
                href="mailto:info@dialexportmart.com"
                className="text-blue-600 text-sm md:text-lg font-bold hover:underline break-all"
              >
                info@dialexportmart.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactRating;