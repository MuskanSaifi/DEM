import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AppDownload = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 items-center gap-10 bg-white rounded-2xl shadow-lg p-10">

          {/* Left Image */}
          <div className="flex justify-center">
            <Image
              src="/assets/app.png"
              alt="Mobile App"
              width={450}
              height={450}
              className="object-contain"
            />
          </div>

          {/* Right Content */}
      {/* Right Content */}
<div className="flex flex-col justify-center">
  <span className="inline-block text-sm font-semibold text-indigo-600 mb-2">
    Mobile Application
  </span>

  <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
    Download Our New App
  </h2>

  <p className="text-gray-600 max-w-md mb-8">
    Scan the QR code or use the buttons below to install Dial Export Mart app on your smartphone.
  </p>

  <div className="flex items-center gap-6 bg-gray-50 rounded-xl p-5 shadow-sm w-fit">
    
    {/* QR Code */}
    <div className="bg-white p-3 rounded-lg shadow">
      <Image
        src="/assets/app-scanner.png"
        alt="Scan App"
        width={110}
        height={110}
      />
    </div>
    {/* Store Buttons */}
    <div className="flex flex-col gap-3">
      <a
        href="https://play.google.com/store/apps/details?id=com.nazim_saifi.dialexportmart"
        target="_blank"
        className="hover:scale-105 transition"
      >
        <Image src="/assets/play-store.png" alt="Google Play" width={160} height={50} />
      </a>

      <a
        href="https://apps.apple.com/in/app/dialexportmart/id6751717591?platform=iphone"
        target="_blank"
        className="hover:scale-105 transition"
      >
        <Image src="/assets/app-store.png" alt="App Store" width={160} height={50} />
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
