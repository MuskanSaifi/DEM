import React from 'react';
import Image from 'next/image';

const ContactRating = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 bg-white rounded-3xl shadow-sm overflow-hidden p-8 md:p-12">
        
        {/* Left Image Side */}
        <div className="relative w-full md:w-1/2 h-[400px] md:h-[500px]">
          <Image
            src="/assets/contact-girl.png"
            alt="Support Person"
            fill
            className="object-contain md:object-cover rounded-2xl"
            priority
          />
        </div>

        {/* Right Info Section */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <div className="text-5xl font-extrabold text-gray-900">4.9/5.0</div>

          <div className="text-yellow-500 text-3xl">⭐⭐⭐⭐⭐</div>

          <p className="text-gray-600 text-lg">Rated by 700+ customers for 3200+ clients</p>

          {/* Call Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300">
            <span className="text-red-500 text-3xl">📞</span>
            <div className="text-start">
              <p className="text-sm font-semibold uppercase mb-0 text-gray-600">Call for advice now!</p>
              <a
                href="tel:+918448668076"
                className="text-blue-600 text-lg font-bold hover:underline"
              >
                +91 84486 68076
              </a>
            </div>
          </div>

          {/* Email Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300">
            <span className="text-green-500 text-3xl">✉️</span>
            <div className="text-start">
              <p className="text-sm font-semibold uppercase mb-0 text-gray-600">Say hello</p>
              <a
                href="mailto:info@dialexportmart.com"
                className="text-blue-600 text-lg font-bold hover:underline break-all"
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
