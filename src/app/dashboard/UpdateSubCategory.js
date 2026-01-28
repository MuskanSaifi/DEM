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
  const [showProductsList, setShowProductsList] = useState(false); // ✅ Toggle to show/hide products list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // ✅ Products per page
  const [productData, setProductData] = useState({
    id: "",
    name: "",
    category: "",
    subcategory: "",
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

    if (!productData.id || !productData.name || !productData.category || !productData.subcategory) {
      toast.error("⚠️ Please fill all required fields.");
      return;
    }
    
    try {
      // ✅ Remove products from payload - products are automatically assigned based on Product.subCategory field
      const response = await axios.patch(`/api/adminprofile/subcategory`, {
        id: productData.id,
        name: productData.name,
        category: productData.category,
        subcategory: productData.subcategory,
        icon: productData.icon,
        // ❌ Removed: products: productData.products - no longer needed
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Subcategory updated successfully!");
        fetchProducts();
        fetchCategories();
        setProductData({ id: "", name: "", category: "", subcategory: "", icon: "" });
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
        name: selectedSubCat.name || "", // ✅ Pre-fill subcategory name
        subcategory: selectedSubCat._id,
        category: selectedSubCat.category?._id || "",
        icon: selectedSubCat.icon || "",
      });
      setPreviewImage(selectedSubCat.icon || "");

      // ✅ Filter products to show only those belonging to selected subcategory
      const productsForSubCategory = allProducts.filter(
        (product) => product.subCategory?._id === selectedSubCat._id
      );

      setFilteredProducts(productsForSubCategory);
      setCurrentPage(1); // Reset to first page when subcategory changes
    } else {
      setFilteredProducts([]);
      setCurrentPage(1);
    }
  };

  // ❌ Removed handleProductChange - products are automatically assigned based on Product.subCategory field

  const handleDateFilter = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);
    setCurrentPage(1); // Reset to first page when filter changes

    if (!selected) {
      // If no date selected, show products for selected subcategory
      if (productData.subcategory) {
        const selectedSubCat = selectedSubCategory.find((cat) => cat._id === productData.subcategory);
        if (selectedSubCat) {
          const productsForSubCategory = allProducts.filter(
            (product) => product.subCategory?._id === selectedSubCat._id
          );
          setFilteredProducts(productsForSubCategory);
        }
      } else {
        setFilteredProducts([]);
      }
      return;
    }

    const selectedDate = new Date(selected).toDateString();
    // Filter by date AND subcategory
    let baseProducts = allProducts;
    if (productData.subcategory) {
      const selectedSubCat = selectedSubCategory.find((cat) => cat._id === productData.subcategory);
      if (selectedSubCat) {
        baseProducts = allProducts.filter(
          (product) => product.subCategory?._id === selectedSubCat._id
        );
      }
    }
    const filtered = baseProducts.filter((product) => new Date(product.createdAt).toDateString() === selectedDate);
    setFilteredProducts(filtered);
  };

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
        <h3 className="text-center mb-3">🛍️ Update SubCategory</h3>

        <input className="form-control mb-3" type="text" placeholder="Subcategory Name"
          value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })}
          required
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
        
        <div className="alert alert-info mb-3">
          <strong>ℹ️ Note:</strong> Products are automatically assigned to subcategories based on their <code>subCategory</code> field. 
          No manual assignment needed. Update a product's subcategory from the product edit page.
        </div>

        <button className="btn btn-success w-100 shadow" onClick={handleSubmit}>
          ✅ Update Subcategory
        </button>
      </div>

      {/* ✅ Products List Section - Collapsible */}
      {productData.subcategory && (
        <div className="mt-4 card p-3 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              📦 Products in "{productData.name || 'Selected Subcategory'}" ({filteredProducts.length})
            </h4>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowProductsList(!showProductsList)}
            >
              {showProductsList ? "Hide" : "Show"} Products List
            </button>
          </div>

          {showProductsList && (
            <>
              {filteredProducts.length === 0 ? (
                <div className="alert alert-info text-center">
                  <p className="mb-0">No products found for this subcategory.</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Product Name</th>
                          <th>Creator</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {paginatedProducts.map((product, index) => (
                          <tr key={product._id} className="table-success">
                            <td>{startIndex + index + 1}</td>
                            <td><strong>{product.name}</strong></td>
                            <td>{product?.userId?.fullname || "Unknown"}</td>
                            <td>{product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}</td>
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

                  {/* ✅ Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                      </div>
                      <nav>
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                              return (
                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(pageNum)}
                                  >
                                    {pageNum}
                                  </button>
                                </li>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <li key={pageNum} className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                              );
                            }
                            return null;
                          })}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateSubCategory;