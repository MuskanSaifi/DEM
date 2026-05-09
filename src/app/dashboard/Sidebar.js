import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaHome,
  FaImage,
  FaBoxOpen,
  FaMoneyCheckAlt,
  FaUsers,
  FaUserTie,
  FaAddressBook,
  FaBell,
  FaHeadset,
  FaMicrophone,
  FaGlobe,
  FaBullseye,
  FaFileContract,
  FaLayerGroup,
  FaSitemap,
  FaBlog,
  FaPaintBrush,
  FaChartBar,
  FaCertificate,
  FaBan,
  FaStethoscope,
  FaChevronDown,
  FaChevronUp,
  FaUserShield,
} from "react-icons/fa";

const Sidebar = ({ isSidebarOpen, setActiveContent, activeContent }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const sidebarItems = [
    { icon: FaHome, label: "Dashboard" },
    { icon: FaImage, label: "DEM Banners" },
    { icon: FaBoxOpen, label: "Our Packages" },
    { icon: FaMoneyCheckAlt, label: "Client Payments" },
    { icon: FaUsers, label: "All Buyers" },
    { icon: FaUserTie, label: "All Seller" },
    { icon: FaAddressBook, label: "Leads & Enquiry" },
    { icon: FaAddressBook, label: "All Contacts" },
    { icon: FaUsers, label: "All Subscribers" },
    { icon: FaBell, label: "Manage App Notifications" },
    { icon: FaHeadset, label: "Manage Support Members" },
    { icon: FaMicrophone, label: "All Recordings" },
    { icon: FaGlobe, label: "All Clients Website Leads" },
    { icon: FaBullseye, label: "Meta Leads" },
    { icon: FaFileContract, label: "Aggrement" },
    {
      icon: FaLayerGroup,
      label: "Manage Category",
      subItems: ["All Category", "Create Category", "Update Category"],
    },
    {
      icon: FaSitemap,
      label: "Manage Sub Category",
      subItems: ["All Sub Category", "Create Sub Category", "Update Sub Category"],
    },
    {
      icon: FaBlog,
      label: "Manage Blogs",
      subItems: ["All Blogs", "Create Blogs"],
    },
    { icon: FaPaintBrush, label: "Web Templates" },
    { icon: FaChartBar, label: "Report" },
    { icon: FaCertificate, label: "Certificates" },
    { icon: FaBan, label: "Block" },
    { icon: FaStethoscope, label: "Products Diagnostic" },
//    {
//   icon: "/assets/dashboardicons/Manage Blogs.png",
//   label: "Manage Salary",
//   subItems: ["Add Employee", "Leave Requests", "Salary Report"]
// }

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
      <div className="d-flex justify-content-around flex-column align-items-center p-2 sticky top-0 bg-white">
    <Link href="../">
      <Image src="/assets/logo1234.png" alt="Innodem Logo" width={100} height={50}  />
    </Link>
    <h6 className="text-center mt-2 text-sm">
      <FaUserShield className="inline me-1" />
      Welcome! Admin
    </h6>
  </div>

<ul>
{sidebarItems.map((item, index) => (
<li key={index} className={activeContent === item.label || openDropdown === index ? "active" : ""}>
<div
className={`sidebar-item ${openDropdown === index ? "active" : ""}`}
onClick={() => handleItemClick(item.label, index, !!item.subItems)}
style={{ padding: "9px 10px", fontSize: "14px", lineHeight: "1.2" }}
>
<span className="sidebar-icon">
  <item.icon size={18} />
</span>

                {item.label}
                {item.subItems && (
                  <span className="dropdown-arrow">
                    {openDropdown === index ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </span>
                )}
              </div>

              {item.subItems && openDropdown === index && (
                <ul className="dropdown">
                  {item.subItems.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={activeContent === subItem ? "active" : ""}
                      onClick={() => setActiveContent(subItem)}
                      style={{ fontSize: "13px", padding: "7px 10px" }}
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
