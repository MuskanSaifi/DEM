'use client';

import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Userprofile from "./Userprofile";
import BusinessProfile from "./Businessprofile";
import BankDetails from "./Bankdetails";
import AddProducts from "./Addproducts";
import AllProducts from "./Allproducts";
import Payments from "./Payments";
import Enquiry from "./Enquiry";
import Supportperson from "./Supportperson";
import { useSelector } from 'react-redux';
import UserAggrement from "./UserAggrement";

function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("Dashboard");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useSelector((state) => state.user || {});

  useEffect(() => {
    if (!token || !user) {
      router.push('/user/login');
    }
  }, [token, user, router]);

  useEffect(() => {
    const activeTab = searchParams.get('activeTab');
    if (activeTab) {
      setActiveContent(activeTab);
    }
  }, [searchParams]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="resdes-dashboard">
      <Sidebar isSidebarOpen={isSidebarOpen} setActiveContent={setActiveContent} activeContent={activeContent} />
      <div className={`resdes-content ${isSidebarOpen ? "resdes-shrink" : "resdes-expand"}`}>
        <div className="resdes-header">
          <button onClick={toggleSidebar} className="resdes-hamburger" aria-label="Toggle Sidebar">
            &#9776;
          </button>
          <h1 className="text-lg mb-0">{activeContent}</h1>
        </div>
        <div className="resdes-dynamic-content">
          {activeContent === "Dashboard" && <Dashboard />}
          {activeContent === "Payments" && <Payments />}
          {activeContent === "User Profile" && <Userprofile />}
          {activeContent === "Business Profile" && <BusinessProfile />}
          {activeContent === "Bank Details" && <BankDetails />}
          {activeContent === "Add New Product" && <AddProducts />}
          {activeContent === "My Product" && <AllProducts />}
          {activeContent === "Recieved Enquiry" && <Enquiry />}
          {activeContent === "Support Person" && <Supportperson />}
         {activeContent === "Aggrement" && <UserAggrement user={user} />}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
