import { createSlice } from "@reduxjs/toolkit";

const blockedSlice = createSlice({
  name: "blocked",
  initialState: {
    blockedByUser: [],
    blockedByBuyer: [],
  },
  reducers: {
    setBlockedByUser: (state, action) => {
      state.blockedByUser = action.payload; // Array of seller IDs
    },
    setBlockedByBuyer: (state, action) => {
      state.blockedByBuyer = action.payload; // Array of seller IDs
    },
    blockSeller: (state, action) => { 
      const { sellerId, role } = action.payload;
      if (role === "user" && !state.blockedByUser.includes(sellerId)) {
        state.blockedByUser.push(sellerId);
      }
      if (role === "buyer" && !state.blockedByBuyer.includes(sellerId)) {
        state.blockedByBuyer.push(sellerId);
      }
    },
    unblockSeller: (state, action) => {
      const { sellerId, role } = action.payload;
      if (role === "user") {
        state.blockedByUser = state.blockedByUser.filter(id => id !== sellerId);
      }
      if (role === "buyer") {
        state.blockedByBuyer = state.blockedByBuyer.filter(id => id !== sellerId);
      }
    },
  },
});

export const { setBlockedByUser, setBlockedByBuyer, blockSeller, unblockSeller } = blockedSlice.actions;
export default blockedSlice.reducer;
