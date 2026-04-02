"use client";
import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";

const countries = [
  { name: "India", flag: "/countries/In.png", link: "/all-categories" },
  { name: "United Arab Emirates", flag: "/countries/United Arab Emirates.png", link: "/country/ae" },
  { name: "United States", flag: "/countries/Us.png", link: "/country/us" },
  { name: "China", flag: "/countries/Ch.png", link: "/country/cn" },
  { name: "Australia", flag: "/countries/Au.png", link: "/country/au" },
  { name: "Hong Kong", flag: "/countries/Hong Kong.png", link: "/country/hk" },
  { name: "Singapore", flag: "/countries/Singapore.png", link: "/country/sg" },
  { name: "Explore All Countries", flag: "", link: "/all-countries" },
];

const Countries = () => {
  return (
    <>
      <div className="mt-5">

        {/* Heading */}
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 text-center">
          Find Verified Suppliers by Country
        </h2>

        <p className="text-gray-500 text-xs md:text-sm text-center mb-4 md:mb-6 px-2">
          Explore verified manufacturers and exporters from India and other major
          international trade hubs worldwide.
        </p>

        <div className="bg-gray-100 p-3 md:p-6 rounded-lg">

          {/* ✅ MOBILE = 4 visible */}
          <div className="country-scroll flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-6 overflow-x-auto md:overflow-hidden">

            {countries.map((country, index) => (
              <Link
                key={index}
                href={country.link}
                className="
                flex flex-col items-center 
                bg-white 
                p-2 md:p-4 
                rounded-lg 
                shadow-sm md:shadow-md 
                hover:shadow-lg 
                transition 
                min-w-[22%] md:min-w-0
                flex-shrink-0"
              >

                {/* FLAG */}
                {country.flag ? (
                  <Image
                    src={country.flag}
                    alt={country.name}
                    width={60}
                    height={60}
                    className="rounded-full border border-gray-200 
                               w-10 h-10 md:w-[70px] md:h-[70px]"
                  />
                ) : (
                  <span className="text-2xl md:text-4xl">⋯</span>
                )}

                {/* TEXT */}
                <h3 className="text-[10px] md:text-sm text-gray-800 text-center mt-1 md:mt-2 leading-tight">
                  {country.name}
                </h3>

              </Link>
            ))}

          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .country-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .country-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default memo(Countries);