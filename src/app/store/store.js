// spp/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./categorySlice"; // ✅ Import category reducer
import productReducer from "./productSlice";
import userReducer from "./userSlice";
import buyerReducer from "./buyerSlice";
import wishlistReducer from "./wishlistSlice"; // ✅ Import the new slice
import blockedReducer from "./blockedSlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer, // ✅ Add category slice to store
    products: productReducer,  // ✅ Add productSlice to store
    user: userReducer,
    buyer: buyerReducer,
    wishlist: wishlistReducer, // ✅ Add the wishlist reducer
    blocked: blockedReducer,
  },
});
