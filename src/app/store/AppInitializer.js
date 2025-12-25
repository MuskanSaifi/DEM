// app/store/AppInitializer.js
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeBuyer } from "@/app/store/buyerSlice";
// (Optional) import { initializeUser } if you want to persist seller/user too

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore buyer data from localStorage when app loads
    dispatch(initializeBuyer());
  }, [dispatch]);

  return <>{children}</>;
}
