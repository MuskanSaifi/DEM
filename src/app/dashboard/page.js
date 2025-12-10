"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./dashboard.css";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import CreateSubCategory from "./CreateSubCategory";
import UpdateSubCategory from "./UpdateSubCategory";
import UpdateCategory from "./UpdateCategory";
import CreateCategory from "./CreateCategory";
import AllCategory from "./AllCategory";
import AllUsers from "./AllUsers";
import AllSubcategory from "./AllSubcategory";
import AllProducts from "./AllProducts";
import Buyers from "./Buyers";
import Payments from "./Payments";
import AllBlogs from "./AllBlogs";
import CreateBlog from "./CreateBlog";
import AllSubscribers from "./AllSubscribers";
import AllContacts from "./AllContacts";
import LeadsEnquiry from "./LeadsEnquiry";
import CreateSupportPerson from "./CreateSupportPerson";
import AllRecordings from "./AllRecordings";
import AllClientWebsiteLeads from "./AllClientWebsiteLeads";
import SalaryReport from "./SalaryReport";
import LeaveRequests from "./LeaveRequests";
import AddEmployeeForm from "./AddEmployeeForm";
import AddNotifucations from "./AddNotifucations";
import AdminAggrement from "./AdminAggrement";
import Report from "./Report";
import Block from "./Block";
import Banner from "./Banner";
import Plans from "./Plans";

function ResponsiveDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("Dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await axios.get("/api/admin/check-auth");
        if (!res.data.success) {
          router.push("/admin-login");
        } else {
          setLoading(false);
        }
      } catch (error) {
        router.push("/admin-login");
      }
    };

    checkAdminAuth();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });

      if (res.ok) {
        // ✅ Redirect to login page after logout
        router.push("/admin-login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="resdes-dashboard">
      <Sidebar isSidebarOpen={isSidebarOpen} setActiveContent={setActiveContent} activeContent={activeContent} />

<div className={`resdes-content ${isSidebarOpen ? "resdes-shrink" : "resdes-expand"}`}>
 <div className="resdes-header">

<button onClick={toggleSidebar} className="resdes-hamburger" aria-label="Toggle Sidebar">&#9776; </button>

<h1>{activeContent}</h1>

<button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full shadow-md transition duration-300 ease-in-out">
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"/>
  </svg>  Logout
</button>

   </div>
        <div className="resdes-dynamic-content">
          {activeContent === "Dashboard" && <Dashboard />}
          {activeContent === "DEM Banners" && <Banner />}
          {activeContent === "Our Packages" && <Plans />}
          {activeContent === "Client Payments" && <Payments />}
          {activeContent === "All Products" && <AllProducts />}
          {activeContent === "Create Sub Category" && <CreateSubCategory />}
          {activeContent === "Update Sub Category" && <UpdateSubCategory />}
          {activeContent === "Create Category" && <CreateCategory />}
          {activeContent === "Update Category" && <UpdateCategory />}
          {activeContent === "All Category" && <AllCategory />}
          {activeContent === "All Sub Category" && <AllSubcategory />}
          {activeContent === "All Seller" && <AllUsers />}
          {activeContent === "All Buyers" && <Buyers />}
          {activeContent === "All Blogs" && <AllBlogs />}
          {activeContent === "Create Blogs" && <CreateBlog />}
          {activeContent === "All Subscribers" && <AllSubscribers />}
          {activeContent === "Manage App Notifications" && <AddNotifucations />}
          {activeContent === "All Contacts" && <AllContacts />}
          {activeContent === "Leads & Enquiry" && <LeadsEnquiry />}
          {activeContent === "Manage Support Members" && <CreateSupportPerson />}
          {activeContent === "All Recordings" && <AllRecordings />}
          {activeContent === "All Clients Website Leads" && <AllClientWebsiteLeads />}
          {activeContent === "Aggrement" && <AdminAggrement/>}
          {activeContent === "Add Employee" && <AddEmployeeForm />}
          {activeContent === "Salary Report" && <SalaryReport />}
          {activeContent === "Leave Requests" && <LeaveRequests />}
          {activeContent === "Report" && <Report />}
          {activeContent === "Block" && <Block />}
        </div>
      </div>
    </div>
  );
}
export default ResponsiveDashboard;
