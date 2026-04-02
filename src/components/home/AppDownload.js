"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AppDownload = () => {
  return (
    <section className="bg-white py-8 md:py-20">
      <div className="max-w-7xl mx-auto px-3 md:px-0">

        <div className="grid md:grid-cols-2 items-center gap-6 md:gap-10 
                        bg-white rounded-xl md:rounded-2xl 
                        shadow-sm md:shadow-lg 
                        p-4 md:p-10">

          {/* Left Image */}
          <div className="flex justify-center">
            <Image
              src="/assets/app.png"
              alt="Mobile App"
              width={450}
              height={450}
              className="object-contain w-[200px] md:w-auto"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-center text-center md:text-left">

            <span className="text-xs md:text-sm font-semibold text-indigo-600 mb-1 md:mb-2">
              Mobile Application
            </span>

            <b className="text-lg md:text-4xl text-gray-900 leading-tight mb-2 md:mb-3">
              Download Our B2B Marketplace App
            </b>

            <p className="text-gray-600 text-xs md:text-base mb-4 md:mb-8">
              Download the Dial Export Mart app to connect with verified manufacturers, suppliers, exporters, and buyers in India.
            </p>

            {/* QR + Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 
                            bg-gray-50 rounded-lg md:rounded-xl 
                            p-3 md:p-5 shadow-sm w-full md:w-fit">

              {/* QR Code */}
              <div className="bg-white p-2 md:p-3 rounded-lg shadow">
                <Image
                  src="/assets/app-scanner.png"
                  alt="QR Code"
                  width={110}
                  height={110}
                  className="w-16 h-16 md:w-[110px] md:h-[110px]"
                />
              </div>

              {/* Store Buttons */}
              <div className="flex flex-row md:flex-col gap-2 md:gap-3">
                <a
                  href="https://play.google.com/store/apps/details?id=com.nazim_saifi.dialexportmart"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="hover:scale-105 transition"
                >
                  <Image
                    src="/assets/play-store.png"
                    alt="Google Play"
                    width={160}
                    height={50}
                    className="w-[100px] md:w-[160px]"
                  />
                </a>

                <a
                  href="https://apps.apple.com/in/app/dialexportmart/id6751717591?platform=iphone"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="hover:scale-105 transition"
                >
                  <Image
                    src="/assets/app-store.png"
                    alt="App Store"
                    width={160}
                    height={50}
                    className="w-[100px] md:w-[160px]"
                  />
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AppDownload;