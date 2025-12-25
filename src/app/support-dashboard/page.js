"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./dashboard.css";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import AllUsers from "./AllUsers";
import AllProducts from "./AllProducts";
import Buyers from "./Buyers";
import Payments from "./Payments";
import AllContacts from "./AllContacts";
import AllSubscribers from "./AllSubscribers";
import LeadsEnquiry from "./LeadsEnquiry";
import toast from "react-hot-toast";
import AddClientPayment from "./AddClientPayment";
import AddRecording from "./AddRecording";
import AllSellers from "./AllSellers";

function ResponsiveDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("Dashboard");
  const [loading, setLoading] = useState(true);

  const [supportPersonId, setSupportPersonId] = useState(null);
const [supportPerson, setSupportPerson] = useState(null);

useEffect(() => {
  const checkAdminAuth = async () => {
    try {
      const res = await axios.get("/api/support-admins/check-auth");
      if (!res.data.success) {
        router.push("/support-login");
      } else {
        const supportId = res.data.supportId;
        // Now fetch the full support member data
        const memberRes = await axios.get(`/api/adminprofile/supportmembers/${supportId}`);
        if (memberRes.data.success) {
          setSupportPerson(memberRes.data.member); // full support person with access flags
          setSupportPersonId(supportId);
          setLoading(false);
        } else {
          router.push("/support-login");
        }
      }
    } catch (error) {
      router.push("/support-login");
    }
  };

  checkAdminAuth();
}, [router]);

  if (loading) return <p>Loading...</p>;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");

    try {
      const res = await fetch("/api/adminprofile/supportmembers/logout", {
        method: "POST",
      });

      const data = await res.json();
      toast.dismiss(toastId);

      if (data.success) {
              localStorage.removeItem('support_person');
        toast.success("Logout successful");
        setTimeout(() => {
          router.push("/support-login");
        }, 1000);
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="resdes-dashboard">
      <Sidebar isSidebarOpen={isSidebarOpen} setActiveContent={setActiveContent} activeContent={activeContent} />

      <div className={`resdes-content ${isSidebarOpen ? "resdes-shrink" : "resdes-expand"}`}>
        <div className="resdes-header">
          <button onClick={toggleSidebar} className="resdes-hamburger" aria-label="Toggle Sidebar">
            &#9776;
          </button>
          <h1>{activeContent}</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full shadow-md transition duration-300 ease-in-out">
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"/>
  </svg>  Logout
</button>
        </div>
        <div className="resdes-dynamic-content">
{activeContent === "Dashboard" && <Dashboard />}
{activeContent === "Payments" &&( <Payments supportMember={supportPerson} />)}

{activeContent === "All Products" && <AllProducts />}
{activeContent === "All Your Seller" && <AllUsers supportPersonId={supportPersonId} />}
{activeContent === "All Sellers" && <AllSellers supportPersonId={supportPersonId} supportMember={supportPerson}/>}

{activeContent === "All Buyers" && (<Buyers supportMember={supportPerson} />)}
{activeContent === "All Subscribers" && (<AllSubscribers supportMember={supportPerson} />)}
{activeContent === "All Contacts" && (<AllContacts supportMember={supportPerson} />)}
{activeContent === "Leads & Enquiry" && <LeadsEnquiry />}
{activeContent === "Add Client Payment" && <AddClientPayment />}

{activeContent === "Add Recordings" && <AddRecording  supportPersonId={supportPersonId}/>}
        </div>
      </div>
    </div>
  );
}

export default ResponsiveDashboard;
