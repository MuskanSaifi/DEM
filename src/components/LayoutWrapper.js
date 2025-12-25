// src/components/LayoutWrapper.js
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/about" &&
      pathname !== "/dashboard" &&
      pathname !== "/support-dashboard" &&
      pathname !== "/about/aboutstudent" &&
      pathname !== "/about/aboutcollege" ? (
        <Header />
      ) : (
        <div className="res-color2 text-light p-1 text-sm m-0 text-center">
          Welcome back! Let’s make some updates and keep things running great.
        </div>
      )}

      {children}

      {pathname !== "/userdashboard" && <Footer />}
    </>
  );
};

export default LayoutWrapper;
