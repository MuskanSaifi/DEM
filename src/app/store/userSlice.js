// app/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Local storage me data save karna
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      // Local storage se data hataana
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
initializeUser: (state) => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");
  if (storedUser && storedToken) {
    try {
      state.user = JSON.parse(storedUser);
      state.token = storedToken;
      console.log("User and Token initialized from localStorage! Token length:", storedToken.length);
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      state.user = null;
      state.token = null;
    }
  } else {
    console.log("No user or token found in localStorage to initialize.");
  }
},
  },
});

export const { setUser, logout, initializeUser } = userSlice.actions;
export default userSlice.reducer;
