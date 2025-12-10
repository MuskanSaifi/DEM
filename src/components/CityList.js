"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CityList = ({ countryCode }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`/api/location/cities?countryCode=${encodeURIComponent(countryCode)}`);
        const data = await response.json();
        if (data.success) {
          setCities(data.cities);
        } else {
          console.error("❌ API Error:", data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [countryCode]);

  if (loading) return <p className="text-center">Loading cities...</p>;
  if (!cities.length) return <p className="text-center text-red-500">❌ No cities found.</p>;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {cities.map((city, index) => (
        <button
          key={index}
          className="p-3 bg-blue-600 text-white rounded-lg"
          onClick={() => router.push(`/city/${encodeURIComponent(city)}`)}
        >
          {city}
        </button>
      ))}
    </div>
  );
};

export default CityList;
