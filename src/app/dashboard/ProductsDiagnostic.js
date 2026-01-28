// Admin Dashboard - Products Diagnostic Page
// Shows products without subcategory

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Table, Spinner, Button, Card, Badge, Modal, Form } from "react-bootstrap";
import Link from "next/link";
import { Country, State, City } from 'country-state-city';

const ProductsDiagnostic = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateData, setUpdateData] = useState({ 
    category: "", 
    subCategory: "",
    country: "",
    state: "",
    city: ""
  });
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedUsersForWarning, setSelectedUsersForWarning] = useState([]);
  const [sendingWarning, setSendingWarning] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  useEffect(() => {
    fetchDiagnosticData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/adminprofile/addcat");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchDiagnosticData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/diagnostic/products-without-subcategory");
      
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(res.data.message || "Failed to fetch diagnostic data");
      }
    } catch (err) {
      console.error("Error fetching diagnostic data:", err);
      setError("Failed to fetch diagnostic data");
      toast.error("Failed to load diagnostic data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    // Use categoryId if available, otherwise try to find by name
    let categoryId = product.categoryId || "";
    if (!categoryId && product.category) {
      const foundCategory = categories.find(
        (cat) => cat.name === product.category
      );
      if (foundCategory) {
        categoryId = foundCategory._id;
      }
    }
    
    // Initialize country, state, city
    const countryCode = product.country || "";
    const stateName = product.state || "";
    const cityName = product.city || "";
    
    setSelectedCountry(countryCode);
    setUpdateData({
      category: categoryId,
      subCategory: "",
      country: countryCode,
      state: stateName,
      city: cityName,
    });
    
    // Load states if country is available
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode);
      setAvailableStates(states);
      
      // Load cities if state is available
      if (stateName) {
        const selectedStateObj = states.find(s => s.name === stateName);
        if (selectedStateObj) {
          const cities = City.getCitiesOfState(countryCode, selectedStateObj.isoCode);
          setAvailableCities(cities);
        }
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
    
    setShowModal(true);
  };

  const handleCategoryChange = (categoryId) => {
    setUpdateData({
      ...updateData,
      category: categoryId,
      subCategory: "", // Reset subcategory when category changes
    });
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setUpdateData({
      ...updateData,
      country: countryCode,
      state: "", // Reset state when country changes
      city: "", // Reset city when country changes
    });
    
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode);
      setAvailableStates(states);
      setAvailableCities([]);
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    const selectedStateObj = availableStates.find(state => state.name === stateName);
    const stateCode = selectedStateObj ? selectedStateObj.isoCode : "";
    
    setUpdateData({
      ...updateData,
      state: stateName,
      city: "", // Reset city when state changes
    });
    
    if (stateCode && selectedCountry) {
      const cities = City.getCitiesOfState(selectedCountry, stateCode);
      setAvailableCities(cities);
    } else {
      setAvailableCities([]);
    }
  };

  const handleCityChange = (e) => {
    setUpdateData({
      ...updateData,
      city: e.target.value,
    });
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    if (!updateData.category || !updateData.subCategory) {
      toast.error("Please select both category and subcategory");
      return;
    }

    try {
      setUpdating(true);
      const updatePayload = {
        productId: selectedProduct._id,
        category: updateData.category,
        subCategory: updateData.subCategory,
      };
      
      // Add location fields if they are provided
      if (updateData.country) {
        updatePayload.country = updateData.country;
      }
      if (updateData.state) {
        updatePayload.state = updateData.state;
      }
      if (updateData.city) {
        updatePayload.city = updateData.city;
      }
      
      const res = await axios.patch(
        `/api/userprofile/manageproducts/${selectedProduct._id}`,
        updatePayload
      );

      if (res.data.success) {
        toast.success("Product updated successfully!");
        setShowModal(false);
        setSelectedProduct(null);
        setUpdateData({ category: "", subCategory: "" });
        // Refresh the diagnostic data
        fetchDiagnosticData();
      } else {
        toast.error(res.data.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkSelect = () => {
    setBulkSelectMode(!bulkSelectMode);
    if (bulkSelectMode) {
      setSelectedProducts(new Set());
    }
  };

  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === data.productsWithoutSubcategory.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(data.productsWithoutSubcategory.map(p => p._id));
      setSelectedProducts(allIds);
    }
  };

  const handleSendWarning = () => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    // Get unique user IDs from selected products
    const selectedProductData = data.productsWithoutSubcategory.filter(p => 
      selectedProducts.has(p._id)
    );
    const userIds = [...new Set(
      selectedProductData
        .map(p => {
          // Handle different userId formats - ensure we get a clean string ID
          if (!p.userId) {
            console.warn("Product has no userId:", p._id);
            return null;
          }
          
          let userIdValue = null;
          
          // If userId is an object with _id property
          if (p.userId && typeof p.userId === 'object') {
            if (p.userId._id) {
              userIdValue = typeof p.userId._id === 'string' ? p.userId._id : String(p.userId._id);
            } else {
              // If it's an object but no _id, try to stringify and check
              console.warn("userId object without _id:", p.userId);
              return null;
            }
          }
          // If userId is already a string
          else if (typeof p.userId === 'string') {
            userIdValue = p.userId;
          }
          // If userId has toString method
          else if (p.userId && typeof p.userId.toString === 'function') {
            userIdValue = p.userId.toString();
          }
          
          // Validate it's a valid MongoDB ObjectId format (24 hex characters)
          if (userIdValue && /^[0-9a-fA-F]{24}$/.test(userIdValue)) {
            return userIdValue;
          }
          
          console.warn("Invalid userId format:", userIdValue, "for product:", p._id);
          return null;
        })
        .filter(Boolean)
    )];
    
    if (userIds.length === 0) {
      toast.error("No valid users found for selected products");
      return;
    }

    setSelectedUsersForWarning(userIds);
    setShowWarningModal(true);
  };

  const sendWarningNotification = async () => {
    if (selectedUsersForWarning.length === 0) {
      toast.error("No users selected");
      return;
    }

    try {
      setSendingWarning(true);
      // ✅ Get product IDs from selected products
      const selectedProductData = data.productsWithoutSubcategory.filter(p => 
        selectedProducts.has(p._id)
      );
      const productIds = selectedProductData.map(p => p._id);
      
      const res = await axios.post("/api/admin/send-product-warning", {
        userIds: selectedUsersForWarning,
        productIds: productIds, // Send all selected product IDs
        title: "⚠️ Product Update Required",
        message: "Your product(s) are missing subcategory. Please update your product(s) immediately, otherwise our system will delete them.",
      });

      if (res.data.success) {
        toast.success(`Warning sent to ${res.data.data.notificationsCount} user(s)`);
        setShowWarningModal(false);
        setSelectedUsersForWarning([]);
        setSelectedProducts(new Set());
        setBulkSelectMode(false);
      } else {
        toast.error(res.data.message || "Failed to send warning");
      }
    } catch (err) {
      console.error("Error sending warning:", err);
      toast.error("Failed to send warning notification");
    } finally {
      setSendingWarning(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading diagnostic data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={fetchDiagnosticData}>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">No data available</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products Diagnostic</h2>
        <Button onClick={fetchDiagnosticData} variant="primary">
          🔄 Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="border-warning">
            <Card.Body>
              <Card.Title className="text-warning">
                Products Without SubCategory
              </Card.Title>
              <h3 className="text-warning">{data.summary.totalWithoutSubcategory}</h3>
              <p className="text-muted mb-0">
                Products that don't have any subcategory assigned
              </p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="border-danger">
            <Card.Body>
              <Card.Title className="text-danger">
                Products With Invalid SubCategory
              </Card.Title>
              <h3 className="text-danger">{data.summary.totalWithInvalidSubcategory}</h3>
              <p className="text-muted mb-0">
                Products with subcategory ID that doesn't exist
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Products Without SubCategory */}
      {data.productsWithoutSubcategory.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Products Without SubCategory ({data.productsWithoutSubcategory.length})</h4>
            <div className="d-flex gap-2">
              <Button
                variant={bulkSelectMode ? "secondary" : "outline-primary"}
                size="sm"
                onClick={handleBulkSelect}
              >
                {bulkSelectMode ? "Cancel Selection" : "Select Multiple"}
              </Button>
              {bulkSelectMode && (
                <>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedProducts.size === data.productsWithoutSubcategory.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={handleSendWarning}
                    disabled={selectedProducts.size === 0}
                  >
                    ⚠️ Send Warning ({selectedProducts.size})
                  </Button>
                </>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    {bulkSelectMode && <th>
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === data.productsWithoutSubcategory.length}
                        onChange={handleSelectAll}
                      />
                    </th>}
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>State</th>
                    <th>User</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productsWithoutSubcategory.map((product, index) => (
                    <tr key={product._id} className={selectedProducts.has(product._id) ? "table-warning" : ""}>
                      {bulkSelectMode && <td>
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product._id)}
                          onChange={() => handleProductSelect(product._id)}
                        />
                      </td>}
                      <td>{index + 1}</td>
                      <td>
                        <Link href={product.productUrl} target="_blank">
                          {product.name || "N/A"}
                        </Link>
                      </td>
                      <td>
                        <Badge bg="info">{product.category || "No Category"}</Badge>
                      </td>
                      <td>{product.city || "N/A"}</td>
                      <td>{product.state || "N/A"}</td>
                      <td>
                        {product.userId?.fullname || "N/A"}
                        <br />
                        <small className="text-muted">{product.userId?.email || ""}</small>
                      </td>
                      <td>
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateClick(product)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Products With Invalid SubCategory */}
      {data.productsWithInvalidSubcategory.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Products With Invalid SubCategory ({data.productsWithInvalidSubcategory.length})</h4>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Invalid SubCategory ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productsWithInvalidSubcategory.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>
                        <Link
                          href={`https://www.dialexportmart.com/products/${product._id}`}
                          target="_blank"
                        >
                          {product.name || "N/A"}
                        </Link>
                      </td>
                      <td>
                        <Badge bg="danger">{product.invalidSubCategoryId}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateClick(product)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Grouped by Category */}
      {Object.keys(data.groupedByCategory).length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Grouped by Category</h4>
          </Card.Header>
          <Card.Body>
            {Object.keys(data.groupedByCategory).map((category) => (
              <div key={category} className="mb-3">
                <h5>
                  {category}: <Badge bg="warning">{data.groupedByCategory[category].length}</Badge> products
                </h5>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Grouped by City */}
      {Object.keys(data.groupedByCity).length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Grouped by City</h4>
          </Card.Header>
          <Card.Body>
            {Object.keys(data.groupedByCity).map((city) => (
              <div key={city} className="mb-3">
                <h5>
                  {city}: <Badge bg="info">{data.groupedByCity[city].length}</Badge> products
                </h5>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {data.productsWithoutSubcategory.length === 0 &&
        data.productsWithInvalidSubcategory.length === 0 && (
          <Card>
            <Card.Body className="text-center">
              <h4 className="text-success">✅ All Good!</h4>
              <p>All products have valid subcategory assigned.</p>
            </Card.Body>
          </Card>
        )}

      {/* Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <div className="mb-3">
                <strong>Product:</strong> {selectedProduct.name}
              </div>
              <div className="mb-3">
                <strong>Current Category:</strong>{" "}
                <Badge bg="info">{selectedProduct.category || "No Category"}</Badge>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Category *</Form.Label>
                  <Form.Select
                    value={updateData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Select SubCategory *</Form.Label>
                  <Form.Select
                    value={updateData.subCategory}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, subCategory: e.target.value })
                    }
                    disabled={!updateData.category}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {categories
                      .find((cat) => cat._id === updateData.category)
                      ?.subcategories?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                  </Form.Select>
                  {!updateData.category && (
                    <Form.Text className="text-muted">
                      Please select a category first
                    </Form.Text>
                  )}
                </Form.Group>

                <hr className="my-4" />
                <h6 className="mb-3">Location Details</h6>

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                  >
                    <option value="">Select Country</option>
                    {Country.getAllCountries().map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    value={updateData.state}
                    onChange={handleStateChange}
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {availableStates.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </Form.Select>
                  {!selectedCountry && (
                    <Form.Text className="text-muted">
                      Please select a country first
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    value={updateData.city}
                    onChange={handleCityChange}
                    disabled={!updateData.state}
                  >
                    <option value="">Select City</option>
                    {availableCities.map((city, index) => (
                      <option key={index} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Select>
                  {!updateData.state && (
                    <Form.Text className="text-muted">
                      Please select a state first
                    </Form.Text>
                  )}
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={!updateData.category || !updateData.subCategory || updating}
          >
            {updating ? "Updating..." : "Update Product"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Warning Notification Modal */}
      <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Send Warning Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <strong>Warning:</strong> You are about to send a warning notification to{" "}
            {selectedUsersForWarning.length} user(s) about their products missing subcategory.
          </div>

          <div className="mb-3">
            <strong>Selected Products:</strong> {selectedProducts.size}
          </div>

          <div className="mb-3">
            <strong>Affected Users:</strong> {selectedUsersForWarning.length}
          </div>

          <div className="mb-3">
            <strong>Message Preview:</strong>
            <div className="border p-3 mt-2 bg-light rounded">
              <strong>⚠️ Product Update Required</strong>
              <br />
              Your product(s) are missing subcategory. Please update your product(s) immediately,
              otherwise our system will delete them.
            </div>
          </div>

          <div className="alert alert-danger">
            <small>
              <strong>Note:</strong> Users will receive this notification on their dashboard and via
              push notification (if enabled). They must update their products to avoid deletion.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWarningModal(false)}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={sendWarningNotification}
            disabled={sendingWarning || selectedUsersForWarning.length === 0}
          >
            {sendingWarning ? "Sending..." : `Send Warning to ${selectedUsersForWarning.length} User(s)`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductsDiagnostic;
