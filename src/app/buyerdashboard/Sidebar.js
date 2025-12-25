"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux"; // ✅ Import useSelector

const Sidebar = ({ isSidebarOpen, setActiveContent, activeContent }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  // ✅ Get buyer data directly from Redux store
  const buyerdata = useSelector((state) => state.buyer.buyer);

  const sidebarItems = [
    { icon: "/assets/dashboardicons/profile-1.png", label: "Buyer Profile" },
    { icon: "/assets/dashboardicons/Wishlist.png", label: "Wishlist Items" },
    { icon: "/assets/dashboardicons/Block.png", label: "Blocked Seller" },
    { icon: "/assets/dashboardicons/help-&-support.png", label: "Help Desk" },
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="custon-sidebar">
      <div className={`resdes-sidebar ${isSidebarOpen ? "" : "resdes-closed"}`}>
        <h6 className="text-center mt-2">
          🧑 Welcome!{" "}
          <span className="font-semibold">
            {buyerdata?.fullname || buyerdata?.mobileNumber || "Guest"}
          </span>
        </h6>

        <ul>
          {sidebarItems.map((item, index) => (
            <li key={index} className={activeContent === item.label ? "active" : ""}>
              <div
                className="sidebar-item"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    item.subItems
                      ? toggleDropdown(index)
                      : setActiveContent(item.label);
                  }
                }}
              >
                {item.icon && (
                  <span className="sidebar-icon">
                    {item.icon.startsWith("/") ? (
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={44}
                        height={44}
                      />
                    ) : (
                      item.icon
                    )}
                  </span>
                )}
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
  );
};

export default Sidebar;
