import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Fetch products by subcategory
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (subcategory, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/products?subcategory=${encodeURIComponent(subcategory.trim().toLowerCase())}`
      );
      return response.data.products || [];
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch products");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    filteredProducts: [],
    loading: false,
    error: null,
    filters: {
      priceRange: [0, 100000], // Default price range
      time: "", // Default time filter
    },
  },

  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // ✅ Apply filters to products
      state.filteredProducts = state.products.filter((product) => {
        const { priceRange, time } = state.filters;
        return (
          product.price >= priceRange[0] &&
          product.price <= priceRange[1] &&
          (time ? product.addedTime?.includes(time) : true)
        );
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters } = productSlice.actions;
export default productSlice.reducer;
