"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FilterSidebar({ 
  products = [], 
  onFilterChange 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get filter values from URL params - use local state for price/MOQ to avoid URL lag
  const [localMinPrice, setLocalMinPrice] = useState(() => {
    const val = searchParams.get("minPrice");
    return val ? parseInt(val) : "";
  });
  const [localMaxPrice, setLocalMaxPrice] = useState(() => {
    const val = searchParams.get("maxPrice");
    return val ? parseInt(val) : "";
  });
  const [localMinMOQ, setLocalMinMOQ] = useState(() => searchParams.get("minMOQ") || "");
  const [localMaxMOQ, setLocalMaxMOQ] = useState(() => searchParams.get("maxMOQ") || "");

  // Sync local state with URL params when they change externally
  useEffect(() => {
    const urlMinPrice = searchParams.get("minPrice");
    const urlMaxPrice = searchParams.get("maxPrice");
    const urlMinMOQ = searchParams.get("minMOQ");
    const urlMaxMOQ = searchParams.get("maxMOQ");
    
    if (urlMinPrice !== (localMinPrice?.toString() || "")) {
      setLocalMinPrice(urlMinPrice ? parseInt(urlMinPrice) : "");
    }
    if (urlMaxPrice !== (localMaxPrice?.toString() || "")) {
      setLocalMaxPrice(urlMaxPrice ? parseInt(urlMaxPrice) : "");
    }
    if (urlMinMOQ !== localMinMOQ) {
      setLocalMinMOQ(urlMinMOQ || "");
    }
    if (urlMaxMOQ !== localMaxMOQ) {
      setLocalMaxMOQ(urlMaxMOQ || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const businessType = searchParams.get("businessType") || "";

  // Memoize range calculations to avoid recalculation on every render
  const priceRange = useMemo(() => {
    if (!products || products.length === 0) return [0, 100000];
    let min = Infinity;
    let max = 0;
    for (let i = 0; i < products.length; i++) {
      const price = products[i]?.price || 0;
      if (price > 0 && price < min) min = price;
      if (price > max) max = price;
    }
    return [isFinite(min) && min !== Infinity ? min : 0, isFinite(max) ? max : 100000];
  }, [products]); // Recalculate only when products array reference changes

  const moqRange = useMemo(() => {
    if (!products || products.length === 0) return [0, 1000];
    let min = Infinity;
    let max = 0;
    for (let i = 0; i < products.length; i++) {
      const moq = products[i]?.minimumOrderQuantity || 0;
      if (moq > 0 && moq < min) min = moq;
      if (moq > max) max = moq;
    }
    return [isFinite(min) && min !== Infinity ? min : 0, isFinite(max) ? max : 1000];
  }, [products]); // Recalculate only when products array reference changes

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    price: true,
    moq: true,
    businessType: true,
    material: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Debounce timer refs for price and MOQ
  const priceDebounceRef = useRef(null);
  const moqDebounceRef = useRef(null);

  // Handle filter changes with debounce for price and MOQ
  const handleFilterChange = useCallback((key, value) => {
    // Clear existing debounce timer
    if (key === "minPrice" || key === "maxPrice") {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    } else if (key === "minMOQ" || key === "maxMOQ") {
      if (moqDebounceRef.current) {
        clearTimeout(moqDebounceRef.current);
      }
    }

    // For price and MOQ, debounce the URL update
    if (key === "minPrice" || key === "maxPrice") {
      priceDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (value === "" || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
        
        params.delete("page");
        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      }, 500); // 500ms debounce
    } else if (key === "minMOQ" || key === "maxMOQ") {
      moqDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (value === "" || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
        
        params.delete("page");
        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      }, 500); // 500ms debounce
    } else {
      // For other filters, update immediately
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      
      params.delete("page");
      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }
    
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
  }, [searchParams, pathname, router, onFilterChange]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
      if (moqDebounceRef.current) {
        clearTimeout(moqDebounceRef.current);
      }
    };
  }, []);

  // Static business types list (as per user requirement)
  const staticBusinessTypes = [
    'Exporter',
    'Importer', 
    'Manufacturer',
    'Wholesaler',
    'Retailer',
    'Supplier'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 sticky top-4">
      <div className="text-lg font-bold mb-4 flex bg-dark text-light p-2 rounded-lg items-center justify-between">
        Filter By
        <button
          onClick={() => {
            router.push(pathname, { scroll: false });
          }}
          className="text-sm text-white-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="border-b pb-4 mb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between font-semibold mb-2"
        >
          Price Range
          {openSections.price ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {openSections.price && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={localMinPrice || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalMinPrice(val === "" ? "" : parseInt(val) || "");
                  handleFilterChange("minPrice", val);
                }}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={localMaxPrice || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalMaxPrice(val === "" ? "" : parseInt(val) || "");
                  handleFilterChange("maxPrice", val);
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </p>
          </div>
        )}
      </div>

      {/* MOQ Range */}
      <div className="border-b pb-4 mb-4">
        <button
          onClick={() => toggleSection("moq")}
          className="w-full flex items-center justify-between font-semibold mb-2"
        >
          MOQ (Minimum Order Quantity)
          {openSections.moq ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {openSections.moq && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min MOQ"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={localMinMOQ}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalMinMOQ(val);
                  handleFilterChange("minMOQ", val);
                }}
              />
              <input
                type="number"
                placeholder="Max MOQ"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={localMaxMOQ}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalMaxMOQ(val);
                  handleFilterChange("maxMOQ", val);
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Range: {moqRange[0]} - {moqRange[1]}
            </p>
          </div>
        )}
      </div>

      {/* Business Type */}
      <div className="border-b pb-4 mb-4">
        <button
          onClick={() => toggleSection("businessType")}
          className="w-full flex items-center justify-between font-semibold mb-2"
        >
          Business Type
          {openSections.businessType ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {openSections.businessType && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {staticBusinessTypes.map((type, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="radio"
                  name="businessType"
                  checked={businessType === type}
                  onChange={(e) => 
                    handleFilterChange("businessType", e.target.checked ? type : "")
                  }
                  className="rounded"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Certification Display Section (Non-filter, just for display) */}
      <div className="border-b pb-4 mb-4">
        <div className="text-lg font-bold mb-3 text-gray-800">Certification</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <span className="text-green-600 font-bold text-base">✓</span>
            <span className="text-sm font-medium text-gray-700">GST Certified</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <span className="text-blue-600 font-bold text-base">✓</span>
            <span className="text-sm font-medium text-gray-700">FSSAI Certified</span>
          </div>
        </div>
      </div>


      {/* Material Filter (if available) */}
      {products.some(p => p.specifications?.material) && (
        <div className="border-b pb-4 mb-4">
          <button
            onClick={() => toggleSection("material")}
            className="w-full flex items-center justify-between font-semibold mb-2"
          >
            Material
            {openSections.material ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openSections.material && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...new Set(products.map(p => p.specifications?.material).filter(Boolean))]
                .slice(0, 10)
                .map((mat, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="material"
                      checked={searchParams.get("material") === mat}
                      onChange={(e) => 
                        handleFilterChange("material", e.target.checked ? mat : "")
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{mat}</span>
                  </label>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

