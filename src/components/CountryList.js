"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CountryList() {
  const [countries, setCountries] = useState([]);
  const router = useRouter();

useEffect(() => {
  let ok = true;

  fetch("/api/location/countries", { next: { revalidate: 300 }})
    .then(r => r.json())
    .then(data => { if(ok) setCountries(data.countries); });

  return () => { ok = false };
}, []);


  return (
    <div className="grid grid-cols-4 gap-4 p-5 d-none">
  {countries.map((country, index) => (
  <div
    key={country ? `country-${country}` : `index-${index}`} 
    className="p-4 border rounded-lg text-center cursor-pointer hover:shadow-md"
    onClick={() => router.push(`/country/${country}`)}
    >
{/* <Image 
  src={`/flags/${country ? country.toLowerCase() : "default"}.png`}
  alt={country || "Default Flag"}
  width={80} 
  height={80} 
  className="mx-auto"
/> */}
    <p className="mt-2">{country}</p>
  </div>
))}

    </div>
  );
}
