// app/store/providers.js
"use client"; 
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store";  // Store ka path sahi rakhein

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <Toaster position="top-center" />
      {children}
    </Provider>
  );
}
