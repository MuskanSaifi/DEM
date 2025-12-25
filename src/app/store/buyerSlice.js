// app/store/buyerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  buyer: null,
  token: null, // in case buyer authentication is added later
};

const buyerSlice = createSlice({
  name: "buyer",
  initialState,
  reducers: {

    setBuyer: (state, action) => {
      state.buyer = action.payload.buyer;
      state.token = action.payload.token || null;

      // ✅ Save to localStorage
      localStorage.setItem("buyer", JSON.stringify(action.payload.buyer));
      if (action.payload.token) {
        localStorage.setItem("buyerToken", action.payload.token);
      }
    },

    logoutBuyer: (state) => {
      state.buyer = null;
      state.token = null;
      // ✅ Remove from localStorage
      localStorage.removeItem("buyer");
      localStorage.removeItem("buyerToken");
    },

    initializeBuyer: (state) => {
      const storedBuyer = localStorage.getItem("buyer");
      const storedToken = localStorage.getItem("buyerToken");

      if (storedBuyer && storedToken) {
        try {
          state.buyer = JSON.parse(storedBuyer);
          state.token = storedToken || null;
          console.log("✅ Buyer initialized from localStorage");
        } catch (error) {
          console.error("Error parsing buyer from localStorage:", error);
          state.buyer = null;
          state.token = null;
        }
      } else {
        console.log("⚠️ No buyer data found in localStorage");
      }
    },

  },
});

export const { setBuyer, logoutBuyer, initializeBuyer } = buyerSlice.actions;
export default buyerSlice.reducer;

