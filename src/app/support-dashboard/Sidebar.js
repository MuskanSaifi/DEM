import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Sidebar = ({ isSidebarOpen, setActiveContent, activeContent }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const sidebarItems = [
    { icon: "/assets/dashboardicons/Dashboard.png", label: "Dashboard" },
    { icon: "/assets/dashboardicons/Payments.png", label: "Payments" },
    { icon: "/assets/dashboardicons/All Buyers.png", label: "All Buyers" },
    { icon: "/assets/dashboardicons/All-Sellers.png", label: "All Your Seller" },
    { icon: "/assets/dashboardicons/all sellers.png", label: "All Sellers" },
    { icon: "/assets/dashboardicons/Leads-Enquiry.png", label: "Leads & Enquiry" },
    { icon: "/assets/dashboardicons/All Contacts.png", label: "All Contacts" },
    { icon: "/assets/dashboardicons/All Subscribers.png", label: "All Subscribers" },
    { icon: "/assets/dashboardicons/add client payment.png", label: "Add Client Payment" },
    { icon: "/assets/dashboardicons/add recording.png", label: "Add Recordings" },
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleItemClick = (label, index, hasSubItems) => {
    if (hasSubItems) {
      toggleDropdown(index);
    } else {
      setActiveContent(label);
      setOpenDropdown(null); // Close any open dropdown when clicking a normal menu item
    }
  };

  return (
    <div className="custon-sidebar">
      <div className={`resdes-sidebar ${isSidebarOpen ? "" : "resdes-closed"}`}>
        <div className="d-flex justify-content-around align-items-center m-2">
          <Link href="../">
            <Image src="/assets/logo123.png" alt="Innodem Logo" width={100} height={50} />
          </Link>        </div>
          <h6 className="text-center mt-2">🧑  Welcome! Support Team</h6>
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index} className={activeContent === item.label || openDropdown === index ? "active" : ""}>
                <div
                  className={`sidebar-item ${openDropdown === index ? "active" : ""}`}
                  onClick={() => handleItemClick(item.label, index, !!item.subItems)}
                >
                  {item.icon && <span className="sidebar-icon">
                      {item.icon.startsWith("/") ? (
                        <Image src={item.icon} alt={item.label} width={40} height={40} />
                      ) : (
                        item.icon
                      )}
                      </span>}
                  {item.label}
                  {item.subItems && <span className="dropdown-arrow">{openDropdown === index ? "▲" : "▼"}</span>}
                </div>

                {item.subItems && openDropdown === index && (
                  <ul className="dropdown">
                    {item.subItems.map((subItem, subIndex) => (
                      <li
                        key={subIndex}
                        className={activeContent === subItem ? "active" : ""}
                        onClick={() => setActiveContent(subItem)}
                      >
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
  );
};

export default Sidebar;
