// store/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from 'react-hot-toast'; 

// 🎯 Helper function to get the current auth details
const getAuthDetails = (getState) => {
    const { user, buyer } = getState();
    // Prioritize 'User' (seller/admin) token if available, otherwise use 'Buyer' token
    if (user.token && user.user) {
        return { token: user.token, role: 'user', id: user.user._id };
    }
    if (buyer.token && buyer.buyer) {
        // Assuming buyer._id is the ID for the buyer model
        return { token: buyer.token, role: 'buyer', id: buyer.buyer._id };
    }
    return { token: null, role: null, id: null };
};

// Async Thunks for API calls
export const fetchUserWishlist = createAsyncThunk(
    "wishlist/fetchUserWishlist",
    async (_, { rejectWithValue, getState }) => {
        const { token, role } = getAuthDetails(getState); // Use helper
        if (!token) {
            return rejectWithValue("No authentication token found.");
        }

        try {
            // Pass the role to the API so it knows whether to fetch a User's or a Buyer's wishlist
            const response = await axios.get(`/api/wishlist?role=${role}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.wishlist || [];
        } catch (error) {
            console.error(`❌ Error fetching ${role} wishlist:`, error);
            return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
        }
    }
);

export const addProductToWishlist = createAsyncThunk(
    "wishlist/addProductToWishlist",
    async (productId, { rejectWithValue, getState }) => {
        const { token, role } = getAuthDetails(getState); // Use helper

        if (!token) {
            toast.error("Please log in to add to wishlist.");
            return rejectWithValue("No authentication token found.");
        }
        try {
            const response = await axios.post(
                "/api/wishlist",
                { productId, role }, // Pass the role to the API
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Product added to wishlist! 🛒");
            return response.data.wishlist;
        } catch (error) {
            console.error("❌ Error adding product to wishlist:", error);
            const errorMessage = error.response?.data?.message || "Failed to add product to wishlist";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const removeProductFromWishlist = createAsyncThunk(
    "wishlist/removeProductFromWishlist",
    async (productId, { rejectWithValue, getState }) => {
        const { token, role } = getAuthDetails(getState); // Use helper

        if (!token) {
            toast.error("Please log in to remove from wishlist.");
            return rejectWithValue("No authentication token found.");
        }

        try {
            // Pass the role as a query parameter for DELETE
            const response = await axios.delete(`/api/wishlist/${productId}?role=${role}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Product removed from wishlist! 💔");
            return response.data.wishlist;
        } catch (error) {
            console.error("❌ Error removing product from wishlist:", error);
            const errorMessage = error.response?.data?.message || "Failed to remove product from wishlist";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
      state.loading = false;
      toast.success("Wishlist cleared!"); // Optional: Toast for clearing wishlist on logout
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchUserWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Product to Wishlist
      .addCase(addProductToWishlist.pending, (state) => {
        // You might consider a toast for 'Adding...' here, but often 'success' is enough.
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addProductToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Product from Wishlist
      .addCase(removeProductFromWishlist.pending, (state) => {
        // You might consider a toast for 'Removing...' here.
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProductFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeProductFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;