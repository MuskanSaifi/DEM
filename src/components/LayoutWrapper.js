"use client"; // ✅ Ensure this is a Client Component

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCategories } from "../app/store/categorySlice"; // ✅ Corrected Import Path

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

const LayoutWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(fetchCategories()); // ✅ Fetch categories once when the component mounts
  }, [dispatch]);

  return (
    <>
      {/* ✅ Show Header except on certain pages */}
      {pathname !== "/about" &&
      pathname !== "/dashboard" &&
      pathname !== "/support-dashboard" &&
      pathname !== "/about/aboutstudent" &&
      pathname !== "/about/aboutcollege" ? (
        <Header />
      ) : (
        <div className="res-color2 text-light p-1 text-sm m-0 text-center">Welcome back! Let’s make some updates and keep things running great.</div>
      )}

      {children} {/* ✅ Render children inside layout */}

      {/* ✅ Hide Footer only on /userdashboard */}
      {pathname !== "/userdashboard" && <Footer />}

    </>
  );
};

export default LayoutWrapper;
