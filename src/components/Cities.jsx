"use client";
import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";

const cities = [
  { name: "Delhi", icon: "/countries/cities/delhi.png", link: "/city/delhi" },
  { name: "Gurugram", icon: "/countries/cities/gurugram.png", link: "/city/gurgaon" },
  { name: "Kolkata", icon: "/countries/cities/kolkata.png", link: "/city/kolkata" },
  { name: "Mumbai", icon: "/countries/cities/gurugram.png", link: "/city/mumbai" },
  { name: "Chennai", icon: "/countries/cities/chennai.png", link: "/city/chennai" },
  { name: "View All Cities in India", icon: "", link: "/city/all-city" },
];

const Cities = () => {
  return (
    <>
      <div className="mt-5">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 text-center">
          Find Verified B2B Suppliers Across Top Cities in India
        </h2>

        <p className="text-gray-500 text-xs md:text-sm text-center mb-4 md:mb-6 px-2">
          Connect with verified manufacturers and suppliers from major industrial and
          manufacturing hubs across India.
        </p>

        <div className="bg-gray-100 p-3 md:p-6 rounded-lg">

          {/* ✅ MOBILE: 4 visible cards */}
          <div className="city-scroll flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 overflow-x-auto md:overflow-hidden">

            {cities.map((city, index) => (
              <Link
                key={index}
                href={city.link}
                className="
                flex flex-col items-center 
                bg-white 
                p-2 md:p-5 
                rounded-lg 
                shadow-sm md:shadow-md 
                hover:shadow-lg 
                transition 
                min-w-[22%] md:min-w-0
                flex-shrink-0"
              >

                {/* IMAGE */}
                {city.icon ? (
                  <Image
                    src={city.icon}
                    alt={city.name}
                    width={60}
                    height={60}
                    className="rounded-full border border-gray-200 
                               w-10 h-10 md:w-[80px] md:h-[80px]"
                  />
                ) : (
                  <span className="text-2xl md:text-4xl">⋯</span>
                )}

                {/* TEXT */}
                <h3 className="text-[10px] md:text-sm text-gray-800 text-center mt-1 md:mt-2">
                  {city.name}
                </h3>

              </Link>
            ))}

          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .city-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .city-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default memo(Cities);