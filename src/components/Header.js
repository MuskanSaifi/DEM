// src/components/Header.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaChevronDown,
  FaSearch,
  FaMapMarkerAlt,
  FaTh,
  FaHome,
  FaHeart,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaSignOutAlt,
  FaBan,
  FaHeadset,
} from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";
import { logoutBuyer } from "@/app/store/buyerSlice";
import { FaShoppingBag } from "react-icons/fa";
import { BsBriefcaseFill } from "react-icons/bs";
import { logout, initializeUser } from "@/app/store/userSlice";
import SmoothCounter from "./Counter";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All City");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenpopup, setIsOpenpopup] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const PREFIX = 120000;
  const [totalUsers, setTotalUsers] = useState(null); // 120000 + DB count when loaded

  const abortRef = useRef(null);


  const togglepopup = () => {
    setIsOpenpopup(!isOpenpopup);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const toggleDrawer2 = (path) => {
    setIsOpen(false); // Close drawer
    router.push(path); // Navigate
  };

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const router = useRouter();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { buyer } = useSelector((state) => state.buyer || {});

  // NEW: Get wishlist items from the Redux store
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [cities, setCities] = useState(["All City"]); // Store cities from API

useEffect(() => {
  const cached = sessionStorage.getItem("headerCities");

  if (cached) {
    setCities(JSON.parse(cached));
    return;
  }

  (async () => {
    try {
      const res = await fetch("/api/location/allheadercity");
      const data = await res.json();

      if (res.ok && Array.isArray(data.cities)) {
        const list = ["All City", ...data.cities];
        setCities(list);
        sessionStorage.setItem("headerCities", JSON.stringify(list));
      }
    } catch (err) {
      console.error("City fetch error:", err);
    }
  })();
}, []);

  // Total users: 120000 (prefix) + DB count (User + Buyer). Cache 10 min.
  useEffect(() => {
    const CACHE_KEY = "headerUserCountV2";
    const CACHE_TIME_KEY = "headerUserCountTimeV2";
    const TTL_MS = 30 * 60 * 1000; // 30 min – API/CPU load kam, count is interval ke baad refresh

    const cached = sessionStorage.getItem(CACHE_KEY);
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
    if (cached != null && cachedTime != null && Date.now() - parseInt(cachedTime, 10) < TTL_MS) {
      setTotalUsers(PREFIX + parseInt(cached, 10));
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/stats/total-users");
        const data = await res.json();
        const count = res.ok && data.success ? (data.count || 0) : 0;
        sessionStorage.setItem(CACHE_KEY, String(count));
        sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        setTotalUsers(PREFIX + count);
      } catch (err) {
        setTotalUsers(PREFIX);
      }
    })();
  }, []);


useEffect(() => {
  if (suggestions.length === 0) {
    setActiveIndex(-1);
  }
}, [suggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(initializeUser()); // LocalStorage se data load karein
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

const handleLogout = () => {
  setDropdownOpen(false);
  setIsOpen(false);
  if (user) {
    dispatch(logout());
  } else if (buyer) {
    dispatch(logoutBuyer());
  }
  window.location.href = "/"; // redirect to home after logout
};

 useEffect(() => {
  if (searchTerm.trim() === "") {
    setSuggestions([]);
    setIsSearching(false);
    return;
  }

  // 🔥 cancel previous request
  if (abortRef.current) {
    abortRef.current.abort();
  }

  const controller = new AbortController();
  abortRef.current = controller;

  const fetchSuggestions = async () => {
    try {
      setIsSearching(true);

      const res = await fetch(
        `/api/adminprofile/searchbar?search=${encodeURIComponent(searchTerm)}`,
        { signal: controller.signal }
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Search error:", err);
        setSuggestions([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // ⏳ debounce (FAST but safe)
  const timer = setTimeout(fetchSuggestions, 300);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [searchTerm]);


const handleSearchSelect = React.useCallback((product) => {
  setSearchTerm("");        // ✅ input clear
  setSuggestions([]);       // ✅ suggestions hide
  setActiveIndex(-1);       // ✅ reset highlight

  router.push(`/manufacturers/${product.productslug}`);
}, [router]);

const itemRefs = useRef([]);

  const directoryLinks = [
    { label: "Become a Member", href: "/become-a-member" },
    { label: "About Us", href: "/about-us" },
    { label: "What We Do", href: "/what-we-do" },
    { label: "Join Us", href: "/user/register" },
    { label: "Blogs", href: "/blogs" },
  ];

  const helpLinks = [
    { label: "Contact Us", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Terms of Use", href: "/terms-of-use" },
  ];

  // These functions seem out of place in Header.js, they belong in a form component.
  // I'm commenting them out to avoid confusion and potential errors.
  // const handleSubmit = async (e) => { /* ... */ };
  // const handleOtpVerify = async (e) => { /* ... */ };

  return (
    <>
      <header className="bg-light shadow-sm Main-header">
        <div className="container-fluid p-2 text-center top-bar text-dark">
          <p className="mb-0 text-light text-sm marq">
            We connect you with verified export buyers within 24 hours.
          </p>
          <p className="mb-0 text-light text-sm marq2">
            We connect you with verified export buyers within 24 hours,
            guaranteed genuine and confirmed conversations with buyers.
          </p>
        </div>

        {isOpenpopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    {/* ✅ Square Modal */}
    <div className="bg-white rounded-2xl shadow-xl relative 
                w-[90vw] max-w-[750px] max-h-[80vh] p-5 overflow-hidden">
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-xl font-bold text-gray-500 hover:text-black"
        onClick={togglepopup}
      >
        &times;
      </button>

      <div className="h-full flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 
                        rounded-xl p-4 text-center">
          <h2 className="text-xl font-bold text-purple-700">
            Dial Export Mart
          </h2>
          <p className="text-xs text-gray-600">
            Your trusted B2B marketplace partner
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 flex-1">

{/* Card 1 */}
<Link href="/city/all-city" onClick={() => setIsOpenpopup(false)}>
  <div className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
    <div className="relative aspect-square">
      <Image
        src="/assets/location-products.jpg"
        alt="Location"
        fill
        className="object-cover group-hover:scale-105 transition"
      />
    </div>
    <div className="p-2 text-center">
      <h3 className="text-sm font-semibold">Find Suppliers in Your City</h3>
    </div>
  </div>
</Link>

{/* Card 2 */}
<Link href="/grc-certificate" onClick={() => setIsOpenpopup(false)}>
  <div className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
    <div className="relative aspect-square">
      <Image
        src="/assets/certificate.png"
        alt="certificate"
        fill
        className="object-cover group-hover:scale-105 transition"
      />
    </div>
    <div className="p-2 text-center">
      <h3 className="text-sm font-semibold">Find Your Certificate</h3>
    </div>
  </div>
</Link>

{/* Card 3 */}
<Link href="/all-categories" onClick={() => setIsOpenpopup(false)}>
  <div className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
    <div className="relative aspect-square">
      <Image
        src="/assets/categories.jpeg"
        alt="categories"
        fill
        className="object-cover group-hover:scale-105 transition"
      />
    </div>
    <div className="p-2 text-center">
      <h3 className="text-sm font-semibold">View All Categories</h3>
    </div>
  </div>
</Link>

        </div>

      </div>
    </div>
  </div>
)}

        <div className="container-fluid py-3">
          <div className="row align-items-center">
            {/* Logo Section */}
            <div className="col-3 col-md-2 d-flex justify-content-center">
              <Link href="/">
                <Image
                  src="/assets/logo1234.png"
                  alt="B2B Marketplace Logo - Dial Export Mart"
                  width={160}
                  height={60}
                  className="img-fluid"
                />
              </Link>
            </div>

            {/* Search Bar Section */}
            <div className="col-7 col-md-8 p-0  ">
              <div className="d-flex align-items-center justify-content-between">
                <span
                  className="text-4xl p-2 rounded me-3 d-none-mob cursor-pointer"
                  onClick={togglepopup}
                >
                  <FaTh />
                </span>
                {/* City Dropdown Search */}
                <div className="relative d-none-mob" ref={cityDropdownRef}>
                  <button
                    className="flex items-center gap-2 city-search border rounded-lg bg-white shadow-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  >
                    <FaMapMarkerAlt className="text-gray-500" />
                    {selectedCity}
                    <FaChevronDown className="text-gray-500" />
                  </button>

                  {cityDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                      <div className="flex items-center px-3 py-2 border-b">
                        <FaSearch className="text-gray-400" />
                        <input
                          type="text"
                          className="w-full px-2 py-1 outline-none"
                          placeholder="Search City..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                        />
                      </div>
                     <ul className="max-h-60 overflow-y-auto">
  {cities?.length > 0 ? (
  cities
  .filter(
    (city) =>
      typeof city === "string" &&
      city.toLowerCase().includes(citySearch.toLowerCase())
  )
      .map((city, index) => (
        <li key={index}>
<button
  className="w-full text-left ps-2 p-1 hover:bg-gray-100"
  onClick={() => {
    setSelectedCity(city);        // ✅ selected city update
    setCityDropdownOpen(false);  // ✅ dropdown close
    setCitySearch("");           // ✅ search clear (optional)
    if (city === "All City") {
   router.push("/city/all-city");
} else {
  router.push(`/city/${city.toLowerCase()}`);
}

  }}
>
  {city}
</button>
        </li>
      ))
  ) : (
    <p className="text-gray-500 px-4 py-2">No cities found</p>
  )}
</ul>
                    </div>
                  )}
                </div>
                
                {/* 🔲 Global Search Overlay */}
{searchTerm && (
  <div
    className="fixed inset-0 bg-opacity-40 z-40"
    onClick={() => {
      setSearchTerm("");
      setSuggestions([]);
      setActiveIndex(-1);
    }}
  />
)}


       {/* Product Search */}
<div className="position-relative flex-grow-1 pro-ser-div z-50" ref={searchRef}>
<input
  className="product-search form-control"
  type="text"
  placeholder="🔍 B2B Marketplace in India, B2B Portal"
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setActiveIndex(-1); // reset on typing
  }}
onKeyDown={(e) => {
  if (!suggestions.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();

    setActiveIndex((prev) => {
      const next = prev < suggestions.length - 1 ? prev + 1 : 0;

      itemRefs.current[next]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });

      return next;
    });
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();

    setActiveIndex((prev) => {
      const next = prev > 0 ? prev - 1 : suggestions.length - 1;

      itemRefs.current[next]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });

      return next;
    });
  }

  if (e.key === "Enter" && activeIndex >= 0) {
    e.preventDefault();
    handleSearchSelect(suggestions[activeIndex]);
  }
}}


/>


  {/* Show suggestions or "not found" */}
 {(searchTerm.trim() !== "") && (
  <ul className="list-group position-absolute w-100 shadow-sm bg-white text-sm z-50">

    {/* 🔄 LOADING */}
    {isSearching && (
      <li className="list-group-item text-center text-muted">
        🔍 Loading suggestions...
      </li>
    )}

    {/* ✅ RESULTS */}
 {!isSearching && suggestions.length > 0 &&
  suggestions.map((product, index) => (
<li
  ref={(el) => (itemRefs.current[index] = el)}
  key={product._id}
  className={`cursor-pointer px-3 py-2 transition-all duration-150
    ${index === activeIndex ? "bg-purple-600 text-white" : "bg-white"}
  `}
  onMouseEnter={() => setActiveIndex(index)}
  onClick={() => handleSearchSelect(product)}
>
  {product.name}
</li>
  ))}


    {/* ❌ NOT FOUND */}
    {!isSearching && suggestions.length === 0 && (
      <li className="list-group-item text-muted text-center">
        🚫 Product not found
      </li>
    )}
  </ul>
)}


</div>
                {/* Registered Users */}
                <div className="registered-users-box text-center d-none-mob">
                  <div>Registered Users</div>
                  <p>
                    {" "}
{totalUsers == null ? PREFIX.toLocaleString("en-IN") : <SmoothCounter end={totalUsers} duration={2} />}
                  </p>
                </div>
              </div>
            </div>

            {/* User Sections */}
            <div className="col-2 d-flex justify-content-end">
              <div className="d-none-mob mr-auto">
    {user ? (
  // ✅ Seller Logged In Dropdown
  <div className="dropdown2" ref={dropdownRef}>
    <button
      className="dropdown-toggle d-flex align-items-center"
      type="button"
      onClick={toggleDropdown}
      aria-expanded={dropdownOpen}
    >
      <Image
        src="/assets/dashboardicons/profile-1.png"
        alt="User"
        width={40}
        height={40}
      />
      Hi! {user.fullname || "Seller"}
    </button>
    {dropdownOpen && (
      <ul className="dropdown-menu show">
        <li className="dropdown-header text-center fw-bold">Welcome Seller!</li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/userdashboard" onClick={() => setDropdownOpen(false)}><FaHome /> Dashboard</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/wish-list" onClick={() => setDropdownOpen(false)}><FaHeart /> WishList</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/userdashboard?activeTab=User%20Profile" onClick={() => setDropdownOpen(false)}><FaUser /> Profile</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/userdashboard?activeTab=Recieved%20Enquiry" onClick={() => setDropdownOpen(false)}><FaEnvelope /> Inquiries</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/userdashboard?activeTab=Payments" onClick={() => setDropdownOpen(false)}><FaIdCard /> My Membership</Link></li>
        <li><button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
      </ul>
    )}
  </div>
) : buyer ? (
  // ✅ Buyer Logged In Dropdown
  <div className="dropdown2" ref={dropdownRef}>
    <button
      className="dropdown-toggle d-flex align-items-center"
      type="button"
      onClick={toggleDropdown}
      aria-expanded={dropdownOpen}
    >
      <Image
        src="/assets/dashboardicons/profile-1.png"
        alt="Buyer"
        width={40}
        height={40}
      />
      Hi! {buyer.fullname || "Buyer"}
    </button>
    {dropdownOpen && (
      <ul className="dropdown-menu show">
        <li className="dropdown-header text-center fw-bold">Welcome Buyer!</li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/buyerdashboard" onClick={() => setDropdownOpen(false)}><FaHome /> Dashboard</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/buyerdashboard?activeTab=Buyer%20Profile" onClick={() => setDropdownOpen(false)}><FaUser /> Profile</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/buyerdashboard?activeTab=Wishlist%20Items" onClick={() => setDropdownOpen(false)}><FaHeart /> WishList</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/buyerdashboard?activeTab=Blocked%20Seller" onClick={() => setDropdownOpen(false)}><FaBan /> Blocked Sellers</Link></li>
        <li><Link className="dropdown-item d-flex align-items-center gap-2" href="/buyerdashboard?activeTab=Help%20Desk" onClick={() => setDropdownOpen(false)}><FaHeadset /> Help & Support</Link></li>
        <li><button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
      </ul>
    )}
  </div>
) : (
  // ✅ Default (no login)
<div className="d-flex gap-2 position-relative">
  {/* Buyer Button */}
      <div className="relative">
        <button
          onClick={() => router.push("/buyer/register")}
          className="group flex items-center justify-center gap-1 w-full px-3 py-3 font-semibold text-sm rounded-lg shadow-md transition-all duration-300 bg-white text-green-700 border border-green-500 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white"
        >
          <FaShoppingBag className="w-4 h-4 text-green-600 transition-colors duration-300 group-hover:text-white" />
          Buy
        </button>
      </div>
      {/* Seller Button */}
      <div className="relative">
        <button
          onClick={() => router.push("/user/register")}
          className="group flex items-center justify-center gap-1 w-full px-3 py-3 font-semibold text-sm rounded-lg shadow-md transition-all duration-300 bg-white text-purple-700 border border-purple-500 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:text-white"
        >
          <BsBriefcaseFill className="w-4 h-4 text-purple-600 transition-colors duration-300 group-hover:text-white" />
          Sell
        </button>
      </div>
</div>
)}
              </div>

              <div className="d-none-web">
                <div>
                  {/* Button to open the drawer */}
                  <button
                    className="bg-grey-500 text-white text-2xl rounded-2 d-none-web"
                    onClick={toggleDrawer}
                  >
                    <Image
                      src="/assets/dashboardicons/profile-1.png" // or external URL if allowed
                      alt="Description of image"
                      className="d-inline"
                      width={40}
                      height={40}
                    />
                  </button>

                  {/* Bottom Drawer */}
                  <div
                    className={`fixed bottom-0 left-0 w-full bg-white shadow-lg transition-transform ${
                      isOpen ? "translate-y-0" : "translate-y-full"
                    } h-[60vh] z-[9999]`} // Increased z-index
                  >
                    {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
  <div className="text-lg font-semibold mb-0">
    {user ? (
      <span className="text-purple-700">
        <FaUser className="inline me-1" /> Hi! {user.fullname || "Seller"}
      </span>
    ) : buyer ? (
      <span className="text-green-700">
        <FaUser className="inline me-1" /> Hi! {buyer.fullname || "Buyer"}
      </span>
    ) : (
      <span className="text-gray-700">Welcome Guest</span>
    )}
  </div>
  <button className="text-gray-600" onClick={toggleDrawer}>
    ✖
  </button>
</div>


{/* Drawer Content */}
<div className="p-4">
  {user ? (
    // ✅ Seller Logged In
    <>
      <div className="d-flex align-items-center gap-2 fw-semibold">
        <FaUser /> Welcome Seller!
      </div>
      <ul className="mt-4 space-y-2">
        <li>
          <Link className="dropdown-item d-flex align-items-center gap-2" href="/userdashboard" onClick={() => setIsOpen(false)}>
            <FaHome /> Dashboard
          </Link>
        </li>
        <li>
          <Link className="dropdown-item d-flex align-items-center gap-2" href="/wish-list" onClick={() => setIsOpen(false)}>
            <FaHeart /> WishList{" "}
            {wishlistItems.length > 0 && (
              <span className="badge bg-primary rounded-pill ms-1">
                {wishlistItems.length}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/userdashboard?activeTab=User%20Profile"
            onClick={() => setIsOpen(false)}
          >
            <FaUser /> Profile
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/userdashboard?activeTab=Recieved%20Enquiry"
            onClick={() => setIsOpen(false)}
          >
            <FaEnvelope /> Inquiries
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/userdashboard?activeTab=Payments"
            onClick={() => setIsOpen(false)}
          >
            <FaIdCard /> My Membership
          </Link>
        </li>
        <li>
          <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </li>
      </ul>
    </>
  ) : buyer ? (
    // ✅ Buyer Logged In
    <>
      <div className="d-flex align-items-center gap-2 fw-semibold">
        <FaUser /> Welcome Buyer!
      </div>
      <ul className="mt-4 space-y-2">
        <li>
          <Link className="dropdown-item d-flex align-items-center gap-2" href="/buyerdashboard" onClick={() => setIsOpen(false)}>
            <FaHome /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/buyerdashboard?activeTab=Buyer%20Profile"
            onClick={() => setIsOpen(false)}
          >
            <FaUser /> Profile
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/buyerdashboard?activeTab=Wishlist%20Items"
            onClick={() => setIsOpen(false)}
          >
            <FaHeart /> WishList
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/buyerdashboard?activeTab=Blocked%20Seller"
            onClick={() => setIsOpen(false)}
          >
            <FaBan /> Blocked Sellers
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item d-flex align-items-center gap-2"
            href="/buyerdashboard?activeTab=Help%20Desk"
            onClick={() => setIsOpen(false)}
          >
            <FaHeadset /> Help & Support
          </Link>
        </li>
        <li>
          <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </li>
      </ul>
    </>
  ) : (
    // ✅ Guest View
    <>
      {/* --- BUYER / SELLER OPTIONS --- */}
   <div className="flex flex-col gap-4 mb-6">

      {/* Buyer Button */}
      <div className="relative">
        <button
          onClick={() => router.push("/buyer/register")}
          className="group flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-sm rounded-lg shadow-md transition-all duration-300 bg-white text-green-700 border border-green-500 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white"
        >
          <FaShoppingBag className="w-5 h-5 text-green-700 group-hover:text-white transition-colors duration-300" />
          I want to Buy
        </button>
      </div>

      {/* Seller Button */}
      <div className="relative">
        <button
          onClick={() => router.push("/user/register")}
          className="group flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-sm rounded-lg shadow-md transition-all duration-300 bg-white text-purple-700 border border-purple-500 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:text-white"
        >
          <BsBriefcaseFill className="w-5 h-5 text-purple-700 group-hover:text-white transition-colors duration-300" />
          I want to Sell
        </button>
      </div>

    </div>

      {/* Registered Users Counter */}
      <p className="mt-4 text-center text-sm text-gray-500">
        Registered Users:{" "}
        <span className="text-green-600">
{totalUsers == null ? PREFIX.toLocaleString("en-IN") : <SmoothCounter end={totalUsers} duration={2} />}
        </span>
      </p>
    </>
  )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}