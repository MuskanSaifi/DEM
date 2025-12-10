'use client';

import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from "./Sidebar";
import { useSelector, useDispatch } from 'react-redux';
import { initializeBuyer } from "@/app/store/buyerSlice";
import Wishlist from "./Wishlist";
import Blockedseller from "./Blockedseller";
import Help from "./Help";
import BuyerProfile from "./Buyerprofile";

function BuyerDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("Buyer Profile");
  const [isInitialized, setIsInitialized] = useState(false); // ✅ To avoid early redirect

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { buyer, token } = useSelector((state) => state.buyer || {});

  // ✅ Initialize buyer from localStorage on mount
  useEffect(() => {
    dispatch(initializeBuyer());
    setIsInitialized(true);
  }, [dispatch]);

  // 🔒 Redirect to login only *after* initialization
  useEffect(() => {
    if (isInitialized && (!token || !buyer)) {
      router.push("/buyer/login");
    }
  }, [token, buyer, isInitialized, router]);

  // 🔄 Read activeTab from URL (example: ?activeTab=Enquiry)
  useEffect(() => {
    const activeTab = searchParams.get("activeTab");
    if (activeTab) setActiveContent(activeTab);
  }, [searchParams]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isInitialized) {
    // ⏳ Optional: Add a small loader while checking localStorage
    return <div className="text-center mt-10">Loading dashboard...</div>;
  }

  return (
    <div className="resdes-dashboard">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setActiveContent={setActiveContent}
        activeContent={activeContent}
      />
      <div className={`resdes-content ${isSidebarOpen ? "resdes-shrink" : "resdes-expand"}`}>
        <div className="resdes-header">
          <button onClick={toggleSidebar} className="resdes-hamburger" aria-label="Toggle Sidebar">
            &#9776;
          </button>
          <h1 className="text-lg mb-0">{activeContent}</h1>
        </div>

        <div className="resdes-dynamic-content">
          {activeContent === "Buyer Profile" && <BuyerProfile />}
          {activeContent === "Wishlist Items" && <Wishlist />}
          {activeContent === "Blocked Seller" && <Blockedseller />}
          {activeContent === "Help Desk" && <Help />}
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboardPage;
