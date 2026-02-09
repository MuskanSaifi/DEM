import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";

const cities = [
  { name: "Delhi", icon: "/countries/cities/delhi.png", link: "/city/delhi" },
  { name: "Gurugram", icon: "/countries/cities/gurugram.png", link: "/city/gurgaon" },
  { name: "Kolkata", icon: "/countries/cities/kolkata.png", link: "/city/kolkata" },
  { name: "Bijnor", icon: "/countries/cities/gurugram.png", link: "/city/bijnor" },
  { name: "Chennai", icon: "/countries/cities/chennai.png", link: "/city/chennai" },
  { name: "More Cities", icon: "", link: "#" },
];

const Cities = () => {
return (
    <>
    <div className="mt-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
Top Cities in India to Find Verified B2B Suppliers
      </h2>
      <p className="text-gray-500 text-sm text-center mb-6">Connect with verified manufacturers and suppliers from major industrial and
      manufacturing hubs across India.</p>
<div className="bg-gray-100 p-6 rounded-lg">
      <div className="city-scroll flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-x-auto md:overflow-hidden justify-start">
  {cities.map((city, index) => (
  <Link
    key={index}
    href={city.link}
    className="flex flex-col items-center space-y-3 bg-white p-5 my-2 rounded-lg shadow-md hover:shadow-lg transition duration-200 min-w-[100px] flex-shrink-0"
  >
    {city.icon ? (
      <Image
        src={city.icon}
        alt={city.name}
        width={100}
        height={100}
        className="rounded-full border border-gray-300"
      />
    ) : (
      <span className="text-4xl">⋯</span>
    )}
    <h3
      className="text-sm text-gray-800"
      role="heading"
      aria-level="3"
    >
      {city.name}
    </h3>
  </Link>
))}

      </div>
</div>

    </div>
      {/* ✅ Internal CSS to hide scrollbars */}
      <style jsx>{`
        .city-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .city-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </>
  );
};

// ✅ OPTIMIZED: Memoize component to prevent unnecessary re-renders
export default memo(Cities);
