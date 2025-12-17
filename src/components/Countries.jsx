import React from "react";
import Image from "next/image";
import Link from "next/link";

const countries = [
  { name: "India", flag: "/countries/In.png", link: "/country/in" },
    { name: "United Arab Emirates", flag: "/countries/United Arab Emirates.png", link: "/country/ae" },
      { name: "USA", flag: "/countries/Us.png", link: "/country/us" },
  { name: "China", flag: "/countries/Ch.png", link: "/country/cn" },
  { name: "Australia", flag: "/countries/Au.png", link: "/country/au" },
  { name: "Hong Kong", flag: "/countries/Hong Kong.png", link: "/country/hk" },

  { name: "More Regions", flag: "", link: "/all-countries" }, // ✅
];

const Countries = () => {
  return (
    <>
      <div className="bg-gray-100 p-6 rounded-lg mt-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Find Suppliers by Country or Region
        </h2>

        <div className="country-scroll flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-6 overflow-x-auto md:overflow-hidden justify-center">
          {countries.map((country, index) => (
            <Link
              key={index}
              href={country.link}
              className="flex flex-col items-center space-y-3 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 min-w-[100px] flex-shrink-0"
            >
              {country.flag ? (
                <Image
                  src={country.flag}
                  alt={country.name}
                  width={80}
                  height={80}
                  className="rounded-full border border-gray-300"
                />
              ) : (
                <span className="text-4xl">⋯</span>
              )}

              <h3 className="text-sm text-gray-800">
                {country.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* ✅ Hide scrollbar */}
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

export default Countries;
