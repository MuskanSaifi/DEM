import React from "react";
import Image from "next/image";

const countries = [
  { name: "India", flag: "/countries/In.png", link: "/india" },
  { name: "Afghanistan", flag: "/countries/Af.png", link: "#" },
  { name: "Australia", flag: "/countries/Au.png", link: "#" },
  { name: "UAE", flag: "/countries/Bd.png", link: "#" },
  { name: "Pakistan", flag: "/countries/Pk.png", link: "#" },
  { name: "Russia", flag: "/countries/Ru.png", link: "#" },
  { name: "USA", flag: "/countries/Us.png", link: "#" },
  { name: "More Regions", flag: "", link: "#" },
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
          <a
            key={index}
            href={country.link}
            className="flex flex-col items-center space-y-3 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 min-w-[100px] flex-shrink-0"
          >
            {country.flag ? (
              <Image
                src={country.flag || "country flag"}
                alt={country.name}
                width={80}
                height={80}
                className="rounded-full border border-gray-300"
              />
            ) : (
              <span className="text-4xl">⋯</span>
            )}
            <span className="text-md font-medium text-gray-800">{country.name}</span>
          </a>
        ))}
      </div>


    </div>
          {/* ✅ Internal CSS to hide scrollbars */}
      <style jsx>{`
        .country-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .country-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </>
  );
};

export default Countries;
