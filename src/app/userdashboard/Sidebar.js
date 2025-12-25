// app/userdashboard/sidebar.js
import React, { useEffect, useState } from "react";
import Image from "next/image";

const Sidebar = ({ isSidebarOpen, setActiveContent, activeContent }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userdata, setUserdata] = useState("");



  const sidebarItems = [
    { icon: "/assets/dashboardicons/Dashboard.png", label: "Dashboard" },
    {
      icon: "/assets/dashboardicons/profile-1.png",
      label: "Profile",
      subItems: ["User Profile", "Business Profile", "Bank Details", 
        // "Manage Users"
      ],
    },
    {
      icon: "/assets/dashboardicons/products.png",
      label: "Manage Products",
      // subItems: ["Add New Product", "My Product", "My Catalog"],
      subItems: ["Add New Product", "My Product"],
    },
    {
      icon: "/assets/dashboardicons/Leads-Enquiry.png",
      label: "Leads & Enquiry",
      // subItems: ["Recieved Enquiry", "Buy Leads", "My Business Requirement", "Contact Book", "Call Alerts"],
      subItems: ["Recieved Enquiry"],
    },
    { icon: "/assets/dashboardicons/Payments.png", label: "Payments" },
    { icon: "/assets/dashboardicons/support-person.png", label: "Support Person" },
    // { icon: "/assets/dashboardicons/aggrement.png", label: "Aggrement" },

  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");  
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserdata(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <>
      <div className="custon-sidebar">
        <div className={`resdes-sidebar ${isSidebarOpen ? "" : "resdes-closed"}`}>
          <h6 className="text-center mt-2">🧑  Welcome! {userdata?.fullname || "Guest"}</h6>
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index} className={activeContent === item.label ? "active" : ""}>
                <div
                  className="sidebar-item"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      item.subItems ? toggleDropdown(index) : setActiveContent(item.label);
                    }
                  }}
                >
                  {item.icon && <span className="sidebar-icon">
                      {item.icon.startsWith("/") ? (
                        <Image src={item.icon} alt={item.label} width={44} height={44} />
                      ) : (
                        item.icon
                      )}
                  </span>}
                  {item.label}
                  {item.subItems && <span className="dropdown-arrow">▼</span>}
                </div>
                {item.subItems && openDropdown === index && (
                  <ul className="dropdown">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex} onClick={() => setActiveContent(subItem)}>
                        {subItem}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
