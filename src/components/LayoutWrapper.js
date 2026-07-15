// src/components/LayoutWrapper.js
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();

  const hideChrome =
    pathname === "/about" ||
    pathname === "/dashboard" ||
    pathname === "/support-dashboard" ||
    pathname === "/about/aboutstudent" ||
    pathname === "/about/aboutcollege";

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />

      {children}

      {pathname !== "/userdashboard" && <Footer />}
    </>
  );
};

export default LayoutWrapper;
