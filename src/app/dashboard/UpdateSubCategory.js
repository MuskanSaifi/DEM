import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";


const UpdateSubCategory = () => {
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [previewImage, setPreviewImage] = useState("");
const [deletingProductId, setDeletingProductId] = useState(null); // To disable button during deletion
  const [productData, setProductData] = useState({
    id: "",
    name: "",
    category: "",
    subcategory: "",
    products: [],
    icon: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await axios.get(`/api/admin/update-subcategory`);
      setSelectedSubCategory(result.data);
    } catch (error) {
      toast.error("❌ Error fetching subcategories: " + error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const result = await axios.get(`/api/adminprofile/seller`);
      const sortedProducts = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductData((prev) => ({ ...prev, icon: reader.result }));
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productData.id || !productData.name || !productData.category || !productData.subcategory || productData.products.length === 0) {
      toast.error("⚠️ Please fill all fields and select at least one product.");
      return;
    }
    
    try {
      const response = await axios.patch(`/api/adminprofile/subcategory`, {
        id: productData.id,
        name: productData.name,
        category: productData.category,
        subcategory: productData.subcategory,
        products: productData.products,
        icon: productData.icon,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Subcategory updated successfully!");
        fetchProducts();
        fetchCategories();
        setProductData({ id: "", name: "", category: "", subcategory: "", products: [], icon: "" });
        setPreviewImage("");
      } else {
        toast.error("❌ Failed to update subcategory.");
      }
    } catch (error) {
      toast.error("❌ Error updating subcategory: " + error.message);
    }
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCat = selectedSubCategory.find((cat) => cat._id === e.target.value);
    if (selectedSubCat) {
      setProductData({
        ...productData,
        id: selectedSubCat._id,
        subcategory: selectedSubCat._id,
        category: selectedSubCat.category?._id || "",
        icon: selectedSubCat.icon || "",
      });
      setPreviewImage(selectedSubCat.icon || "");

      // ✅ Highlight Products of Selected Subcategory
      const updatedFilteredProducts = allProducts.map((product) => ({
        ...product,
        isSelected: product.subCategory?._id === selectedSubCat._id,
      }));

      setFilteredProducts(updatedFilteredProducts);
    }
  };

  const handleProductChange = (e) => {
    const selectedProducts = Array.from(e.target.selectedOptions, (option) => option.value);
    setProductData({ ...productData, products: selectedProducts });
  };

  const handleDateFilter = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);

    if (!selected) {
      setFilteredProducts(allProducts);
      return;
    }

    const selectedDate = new Date(selected).toDateString();
    const filtered = allProducts.filter((product) => new Date(product.createdAt).toDateString() === selectedDate);
    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId) => {
  if (!window.confirm("Are you sure you want to delete this product?")) {
    return;
  }
  setDeletingProductId(productId);
  try {
    const response = await axios.delete(`/api/adminprofile/seller?id=${productId}`);
    if (response.status === 200) {
      toast.success("Product deleted successfully!");
      fetchProducts(); // Re-fetch products to update the list
    } else {
      toast.error("❌ Failed to delete product.");
    }
  } catch (error) {
    toast.error("❌ Error deleting product: " + error.message);
  } finally {
    setDeletingProductId(null);
  }
};

  return (
    <div className="container mt-3">
      <div className="card p-3 shadow">
        <h3 className="text-center mb-3">🛍️ Add Product and Update SubCategory</h3>

        <input className="form-control mb-3" type="text" placeholder="Enter product name"
          value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })}
        />

        <select className="form-control mb-3" value={productData.subcategory} onChange={handleSubCategoryChange}>
          <option value="">Select Subcategory</option>
          {selectedSubCategory.map((category) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>

        <select className="form-control mb-3" value={productData.category} disabled>
          {selectedSubCategory.filter((cat) => cat._id === productData.subcategory)
            .map((subCategory) => (
              <option key={subCategory.category._id} value={subCategory.category._id}>
                {subCategory.category.name}
              </option>
          ))}
        </select>

<p>Subcategory Icon</p>
        <input type="file" className="form-control mb-3" accept="image/*" onChange={handleImageChange} />
        {previewImage && (
          <div className="mb-3 text-center">
          {previewImage && (
  <Image 
    src={previewImage} 
    alt="Subcategory Preview" 
    width={120} 
    height={120} 
    className="object-cover rounded-lg"
  />
)}
          </div>
        )}
        <input className="form-control mb-3" type="date" value={selectedDate} onChange={handleDateFilter} />
        <p>Select Product want to update in Subcategory</p>
        <select className="form-control mb-3 text-sm h-40 " multiple value={productData.products} onChange={handleProductChange}>
          {filteredProducts.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} - {product.userId?.fullname || "Unknown"} ({new Date(product.createdAt).toLocaleString()})
            </option>
          ))}
        </select>

        <button className="btn btn-success w-100 shadow" onClick={handleSubmit}>
          ✅ Update Subcategory
        </button>
      </div>

      <div className="mt-4 card p-3 shadow">
        <h4 className="text-center mb-2">📦 Products List</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Creator</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Delete Product</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[...filteredProducts].sort((a, b) => a.isSelected === b.isSelected ? 0 : a.isSelected ? -1 : 1)
              .map((product) => (
                <tr key={product._id} className={product.isSelected ? "table-success" : "table-danger"}>
                  <td>{product.name}</td>
                  <td>{product?.userId?.fullname || "Unknown"}</td>
                  <td>{product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}</td>
                  <td>{product.isSelected ? "✅ Subcategory Assigned" : "❌ No Subcategory"}</td>
                <td>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteProduct(product._id)}
            disabled={deletingProductId === product._id}
          >
            {deletingProductId === product._id ? "Deleting..." : "Delete"}
          </button>
        </td>
              
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpdateSubCategory;