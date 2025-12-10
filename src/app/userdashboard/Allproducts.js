import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Modal, Button } from "react-bootstrap";
import LocationSelector from "./components/LocationSelector";
import Image from "next/image";
import Link from "next/link";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedField, setSelectedField] = useState("");

  const [formData, setFormData] = useState({
    basicDetails: {
      name: "",
      productslug: "",
      price: "",
      currency: "INR",
      minimumOrderQuantity: "",
      moqUnit: "Number",
      state: "",
      city: "",
      images: [],
    },
    description: "",
    specifications: {
      productType: "",
      material: "",
      finish: "",
      thicknessTolerance: "",
      thicknessToleranceUnit: "",
      width: "",
      widthUnit: "",
      length: "",
      lengthUnit: "",
      weight: "",
      weightUnit: "",
      metalsType: [],
      widthTolerance: "",
      widthToleranceUnit: "",
      shape: "",
      size: "",
      productName: "",
      thickness: "",
      thicknessUnit: "",
      color: "",
      coating: "",
      woodType: "",
      usage: "",
      processorType: "",
      type: "",
      design: "",
      feature: "",
      metalType: "",
      application: "",
      finishing: "",
      origin: "",
      finishType: "",
      installationType: "",
      otherMaterial: "",
      coverMaterial: "",
      foldable: false,
    },
    tradeInformation: {
      supplyAbility: "",
      supplyQuantity: "",
      supplyUnit: "Per Day",
      deliveryTime: "",
      fobPort: "",
      samplePolicy: "",
      sampleAvailable: null,
      mainExportMarkets: [],
      certifications: "",
      packagingDetails: "",
      paymentTerms: "",
      mainDomesticMarket: "",
    },
    tradeShopping: {
      brandName: "",
      gst: null,
      sellingPriceType: null,
      fixedSellingPrice: "",
      slabPricing: [],
      mrp: "",
      unit: "",
      packSize: "",
      minOrderedPacks: "",
      isReturnable: null,
      stockQuantity: "",
      weightPerUnit: "",
      weightUnit: "",
      shippingType: null,
      packageDimensions: {
        length: null,
        width: null,
        height: null,
        unit: "cm",
      },
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("User not authenticated");
          return;
        }
        const res = await axios.get(`/api/userprofile/manageproducts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.products)) {
          setProducts(res.data.products.reverse());
        } else {
          toast.error(res.data.message || "No products found.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Handle Delete Function
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("User not authenticated");
            return;
          }
          const res = await axios.delete(
            `/api/userprofile/manageproducts/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data.success) {
            toast.success("Product deleted successfully!");
            setProducts((prev) => prev.filter((product) => product._id !== id));
          } else {
            toast.error(res.data.message || "Failed to delete product.");
          }
        } catch (error) {
          toast.error("Failed to delete product.");
        }
      }
    });
  };

  // ✅ Open Modal Function
  const openModal = (product, field) => {
    setSelectedProduct(product);
    setSelectedField(field);

    // Initialize formData with existing product data for the selected field
    const initialFormData = {
      basicDetails: {
        name: product.name || "",
        productslug: product.productslug || "",
        price: product.price || "",
        currency: product.currency || "INR",
        minimumOrderQuantity: product.minimumOrderQuantity || "",
        moqUnit: product.moqUnit || "Number",
        state: product.state || "",
        city: product.city || "",
        images: product.images || [], // Keep existing images
      },
      description: product.description || "",
      specifications: {
        ...product.specifications,
      },
      tradeInformation: {
        ...product.tradeInformation,
      },
      tradeShopping: {
        ...product.tradeShopping,
        packageDimensions: {
          ...product.tradeShopping?.packageDimensions,
        },
      },
    };
    setFormData(initialFormData);
    setShowModal(true);
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");

    setFormData((prevData) => {
      let newData = { ...prevData };

      // Handle nested fields
      if (keys.length === 2) {
        newData = {
          ...prevData,
          [keys[0]]: {
            ...prevData[keys[0]],
            [keys[1]]: type === "checkbox" ? checked : value,
          },
        };
      } else if (keys.length === 3) {
        // For deeply nested fields like packageDimensions
        newData = {
          ...prevData,
          [keys[0]]: {
            ...prevData[keys[0]],
            [keys[1]]: {
              ...prevData[keys[0]][keys[1]],
              [keys[2]]: type === "checkbox" ? checked : value,
            },
          },
        };
      } else {
        // For top-level fields
        newData = { ...prevData, [name]: value };
      }
      return newData;
    });
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      // Prepare updateData based on the selectedField
      let updateData = {
        productId: selectedProduct._id,
      };

      if (selectedField === "basicDetails") {
        updateData = {
          ...updateData,
          name: formData.basicDetails.name,
          productslug: formData.basicDetails.productslug,
          price: Number(formData.basicDetails.price),
          currency: formData.basicDetails.currency,
          minimumOrderQuantity: Number(formData.basicDetails.minimumOrderQuantity),
          moqUnit: formData.basicDetails.moqUnit,
          state: formData.basicDetails.state,
          city: formData.basicDetails.city,
          images: formData.basicDetails.images, // Send updated images
        };
      } else if (selectedField === "description") {
        updateData = {
          ...updateData,
          description: formData.description,
        };
      } else if (selectedField === "specifications") {
        updateData = {
          ...updateData,
          specifications: {
            ...selectedProduct.specifications, // Preserve existing specifications
            ...formData.specifications, // Apply changes from form
            // Ensure numbers are converted
            thicknessTolerance: Number(formData.specifications.thicknessTolerance) || null,
            width: Number(formData.specifications.width) || null,
            length: Number(formData.specifications.length) || null,
            weight: Number(formData.specifications.weight) || null,
            widthTolerance: Number(formData.specifications.widthTolerance) || null,
            thickness: Number(formData.specifications.thickness) || null,
            foldable: formData.specifications.foldable, // Ensure boolean is handled
          },
          tradeInformation: { // Trade information is also updated here
            ...selectedProduct.tradeInformation,
            ...formData.tradeInformation,
            // Convert supplyQuantity to number if it exists
            supplyAbility: formData.tradeInformation?.supplyAbility, // This field is a string, not a number
            // The schema has supplyAbility as a string, so no conversion needed for it directly.
            // If you had separate supplyQuantity and supplyUnit, you'd convert supplyQuantity.
          }
        };
      } else if (selectedField === "tradeShopping") {
        updateData = {
          ...updateData,
          tradeShopping: {
            ...selectedProduct.tradeShopping, // Preserve existing tradeShopping
            ...formData.tradeShopping, // Apply changes from form
            // Ensure numbers are converted
            gst: Number(formData.tradeShopping.gst) || null,
            mrp: Number(formData.tradeShopping.mrp) || null,
            fixedSellingPrice: Number(formData.tradeShopping.fixedSellingPrice) || null,
            packSize: Number(formData.tradeShopping.packSize) || null,
            minOrderedPacks: Number(formData.tradeShopping.minOrderedPabs) || null,
            stockQuantity: Number(formData.tradeShopping.stockQuantity) || null,
            weightPerUnit: Number(formData.tradeShopping.weightPerUnit) || null,
            // Handle nested packageDimensions
            packageDimensions: {
              ...selectedProduct.tradeShopping?.packageDimensions,
              ...formData.tradeShopping?.packageDimensions,
              length: Number(formData.tradeShopping.packageDimensions?.length) || null,
              width: Number(formData.tradeShopping.packageDimensions?.width) || null,
              height: Number(formData.tradeShopping.packageDimensions?.height) || null,
            },
          },
        };
      }

      // Send update request
      const res = await axios.patch(
        `/api/userprofile/manageproducts/${selectedProduct._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Product updated successfully!");

        // Update the products state with the new data
        setProducts((prev) =>
          prev.map((p) => (p._id === selectedProduct._id ? res.data.data : p))
        );

        setShowModal(false);
      } else {
        toast.error(res.data.message || "Failed to update product.");
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      toast.error("Failed to update product.");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    // Limit total images to 4 (existing + new)
    const existingImageCount = selectedProduct?.images?.length || 0;
    if (files.length + existingImageCount > 4) {
      toast.error(`You can upload up to ${4 - existingImageCount} more images.`);
      return;
    }

    const uploadedImages = await Promise.all(files.map(convertToBase64));

    setFormData((prevData) => ({
      ...prevData,
      basicDetails: {
        ...prevData.basicDetails,
        images: [...(selectedProduct?.images || []), ...uploadedImages], // Combine existing and new images
      },
    }));
  };

  // ✅ Convert Image File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract base64 part
        resolve(`data:image/jpeg;base64,${base64String}`); // Ensure proper format
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to determine badge color
  const getBadgeClass = (strength) => {
    switch (strength) {
      case "High":
        return "bg-success"; // Green
      case "Medium":
        return "bg-warning"; // Yellow
      case "Low":
        return "bg-danger"; // Red
      default:
        return "bg-secondary"; // Gray
    }
  };

  // Function to calculate progress percentage based on filled fields
  const calculateProgress = (product) => {
    let totalFields = 0;
    let completedFields = 0;

    const checkAndCount = (obj) => {
      if (!obj) return;
      Object.keys(obj).forEach((key) => {
        // Exclude _id and __v from being counted as fields
        if (key === "_id" || key === "__v" || key === "createdAt" || key === "updatedAt") {
          return;
        }

        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Recursively check nested objects
          checkAndCount(value);
        } else if (Array.isArray(value)) {
          // For arrays, consider it complete if it has elements
          totalFields++;
          if (value.length > 0) {
            completedFields++;
          }
        } else {
          // For primitive values
          totalFields++;
          if (value !== null && value !== "" && value !== undefined && value !== 0) { // Consider 0 as a valid value for numbers
            completedFields++;
          }
        }
      });
    };

    // Main product fields (excluding nested objects which will be handled recursively)
    const topLevelFields = { ...product };
    delete topLevelFields.tradeInformation;
    delete topLevelFields.specifications;
    delete topLevelFields.tradeShopping;
    delete topLevelFields.images; // Handle images separately
    delete topLevelFields.tags; // Admin tags might not be user-filled

    checkAndCount(topLevelFields);
    checkAndCount(product.tradeInformation);
    checkAndCount(product.specifications);
    checkAndCount(product.tradeShopping);
    checkAndCount(product.tradeShopping?.packageDimensions);


    // Special handling for images
    totalFields++; // Count the 'images' field
    if (product.images && product.images.length > 0) {
      completedFields++;
    }

    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  };


  return (
    <div className="container mt-4">
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>{products.length} Products</h5>
        <button className="btn btn-primary">+ Add More Product</button>
      </div> */}

      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center">No products found.</p>
      ) : (
        products.map((product) => {
          // ✅ Fix: Ensure product.images exists and has data before converting
          let productImage = "/default-image.jpg"; // Default Image

          if (product.images && product.images.length > 0 && product.images[0].url) {
            productImage = product.images[0].url;
          }
          return (
            <div key={product._id} className="p-3 mb-3 bg-white all-pro-img rounded-3">
<div className="row g-3 p-3 bg-white rounded-lg shadow-sm mx-0">
  {/* Image and Created At part - 30% width on desktop */}
  <div className="col-12 col-md-3 d-flex flex-column align-items-center text-center">
    {/* col-12 for mobile (full width), col-md-4 for desktop (~33.33% which is close to 30%) */}
 <Link href={`/products/${product._id}`}>
    <Image
      src={productImage}
      alt="Product"
      width={150}
      height={150}
      className="object-cover rounded-md mb-2 shadow-sm border border-gray-200"
      unoptimized
    />
    </Link>
    <div className="text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-md shadow-sm w-full">
      <span className="font-semibold text-gray-900">Created At:</span> <br />
      {product?.createdAt
        ? new Date(product.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A"}
    </div>
  </div>

  {/* Product Details (Name, Category, Price, Progress, Actions) - remaining width */}
  <div className="col-12 col-md-9 flex-grow-1">
    {/* col-12 for mobile (full width), col-md-8 for desktop (~66.66% which is close to 70%) */}
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-2">
      <h6 className="mb-1 text-lg font-bold text-gray-800">
        {product.name} {product?.category?.name}
      </h6>
      <div className="d-flex flex-wrap justify-content-start justify-content-sm-end gap-1">
        <span className="badge bg-light text-dark border common-shad px-2 py-1 rounded-2 text-xs">
          <b>Category:</b> {product?.category?.name}
        </span>
        <span className="badge bg-light text-dark border common-shad px-2 py-1 rounded-2 text-xs">
          <b>Sub Category:</b> {product?.subCategory?.name}
        </span>
      </div>
    </div>

    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-2">
      <strong className="text-xl text-primary">
        INR {product.price ? product.price.toFixed(2) : "N/A"}
      </strong>
      <span className="text-muted text-sm">
        {product.minimumOrderQuantity || "N/A"} Min Order
      </span>
    </div>

    <div className="progress mt-2 h-2 rounded-pill">
      <div
        className="progress-bar bg-success"
        role="progressbar"
        style={{ width: `${calculateProgress(product)}%` }}
        aria-valuenow={calculateProgress(product)}
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>

    <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
      <small className="text-muted font-medium">
        {Math.round(calculateProgress(product))}% Complete
      </small>
      <span
        className={`badge ${getBadgeClass(
          product.strength
        )} text-uppercase px-2 py-1 rounded-pill`}
      >
        {product.strength} Strength
      </span>
    </div>

    <hr className="my-3" />

    <div className="d-flex flex-wrap align-items-center gap-3 justify-content-center justify-content-sm-start">
      <button
        className="btn btn-link text-primary text-sm p-0"
        onClick={() => openModal(product, "basicDetails")}
      >
        + Add Basic Details
      </button>
      <button
        className="btn btn-link text-primary text-sm p-0"
        onClick={() => openModal(product, "description")}
      >
        + Add Description
      </button>
      <button
        className="btn btn-link text-primary text-sm p-0"
        onClick={() => openModal(product, "specifications")}
      >
        + Add Specifications & Trade Information
      </button>
      <button
        className="btn btn-link text-primary text-sm p-0"
        onClick={() => openModal(product, "tradeShopping")}
      >
        + Add Trade Shopping
      </button>
      <FaTrash
        className="text-danger  ms-sm-auto"
        role="button"
        onClick={() => handleDelete(product._id)}
      />
    </div>
  </div>
</div>
            </div>

          );
        })
      )}


      {/* ✅ Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Update {selectedField.replace(/([A-Z])/g, " $1")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>


          {/* Basic details */}
          {selectedField === "basicDetails" && (
            <div>
              {/* Product Name */}
              <div className="mb-3">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="basicDetails.name"
                  value={formData.basicDetails.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, "")      // remove invalid chars
                      .trim()
                      .replace(/\s+/g, "-");             // replace spaces with dashes

                    setFormData({
                      ...formData,
                      basicDetails: {
                        ...formData.basicDetails,
                        name,
                        productslug: slug,
                      },
                    });
                  }}
                />
              </div>

              {/* Product Slug (Read-only or editable, your choice) */}
              <div className="mb-3">
                <label className="form-label">Product Slug</label>
                <input
                  type="text"
                  className="form-control"
                  name="basicDetails.productslug"
                  value={formData.basicDetails.productslug}
                  readOnly
                  disabled
                />
              </div>


              {/* Product Image  */}
              <div className="mb-3">
                <label className="form-label">Upload Images (Max 4)</label>
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload} // ✅ Add event handler
                />
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {formData.basicDetails.images.map((img, index) => (
                    <div key={index} className="position-relative">
                      <Image
                        src={img.url || img} // Use img.url if available, otherwise img directly
                        alt={`Product Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                        unoptimized
                      />
                      {/* Add a remove button if needed */}
                    </div>
                  ))}
                </div>
              </div>


              {/* Price */}
              <div className="mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="basicDetails.price"
                  value={formData.basicDetails.price}
                  onChange={handleChange}
                />
              </div>

              {/* Currency Dropdown */}
              <div className="mb-3">
                <label className="form-label">Currency</label>
                <select
                  className="form-control"
                  name="basicDetails.currency"
                  value={formData.basicDetails.currency}
                  onChange={handleChange}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Minimum Order Quantity */}
              <div className="mb-3">
                <label className="form-label">Minimum Order Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="basicDetails.minimumOrderQuantity"
                  value={formData.basicDetails.minimumOrderQuantity}
                  onChange={handleChange}
                />
              </div>

              {/* MOQ Unit Dropdown */}
              <div className="mb-3">
                <label className="form-label">MOQ Unit</label>
                <select
                  className="form-control"
                  name="basicDetails.moqUnit"
                  value={formData.basicDetails.moqUnit}
                  onChange={handleChange}
                >
                  <option value="Kilogram">Kilogram</option>
                   {/* <!-- New Units Added --> */}
  <option value="Grams">Gram</option>
  <option value="Metric Tons">Metric Ton</option>
  <option value="Ton/Tons">Ton</option>
  <option value="Piece/Pieces">Piece</option>
  <option value="Unit/Units">Unit</option>
  <option value="Dozen">Dozen</option>
  <option value="Pairs">Pair</option>
  <option value="Set/Sets">Set</option>
  <option value="Box/Boxes">Box</option>
  <option value="Carton/Cartons">Carton</option>
  <option value="Bag/Bags">Bag</option>
  <option value="Roll/Rolls">Roll</option>
  <option value="Sheet/Sheets">Sheet</option>
  <option value="Meter/Meters">Meter</option>
  <option value="Centimeter">Centimeter</option>
  <option value="Inch/Inches">Inch</option>
  <option value="Square Feet">Square Feet</option>
  <option value="Square Meter">Square Meter</option>
  <option value="Cubic Feet">Cubic Feet</option>
  <option value="Cubic Meter">Cubic Meter</option>
  <option value="Liter/Liters">Liter</option>
  <option value="Milliliters">Milliliter</option>
  <option value="Gallon/Gallons">Gallon</option>
  <option value="Barrel/Barrels">Barrel</option>
                </select>
              </div>
              <LocationSelector formData={formData} setFormData={setFormData} />

            </div>
          )}

          {/* Description */}
          {selectedField === "description" && (
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows="3"
              />
            </div>
          )}

          {/* Product Specifications & Trade Information Section */}
          {selectedField === "specifications" && (
            <>
              <h5 className="mt-3">Trade Information</h5>
              <div className="row">
              <div className="col-6 mb-3">
                <div className="row">
                  <label className="form-label">Supply Ability</label>
                    <div className="col-md-6 mb-3">
                  <input
                    type="number"
                    className="form-control"
                    name="tradeInformation.supplyQuantity"
                    value={formData.tradeInformation?.supplyQuantity || ""}
                    onChange={handleChange}
                    placeholder="e.g., 1000 Units Per Month"
                  />
                </div>
               <div className="col-md-6 mb-3">
                  <select
                    className="form-control"
                    name="tradeInformation.supplyAbility"
                    value={formData.tradeInformation?.supplyAbility || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Per Day">Per Day</option>
                    <option value="Per Week">Per Week</option>
                    <option value="Per Month">Per Month</option>
                    <option value="Per Year">Per Year</option>
                  </select>
                </div>
                </div>
              </div>


                <div className="col-md-6 mb-3">
                  <label className="form-label">Delivery Time</label>
                  <select
                    className="form-control"
                    name="tradeInformation.deliveryTime"
                    value={formData.tradeInformation?.deliveryTime || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">FOB Port</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tradeInformation.fobPort"
                    value={formData.tradeInformation?.fobPort || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Sample Policy</label>
                  <select
                    className="form-control"
                    name="tradeInformation.samplePolicy"
                    value={formData.tradeInformation?.samplePolicy || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Free Sample">Free Sample</option>
                    <option value="Paid Sample">Paid Sample</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              {/* Sample Available Radio Buttons */}
              <div className="mb-3">
                <label className="form-label d-block">Sample Available</label>
                <div className="d-flex gap-3">
                  {["Yes", "No"].map((option) => (
                    <div key={option} className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="tradeInformation.sampleAvailable"
                        value={option}
                        checked={formData.tradeInformation?.sampleAvailable === option}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row">
             <div className="col-12 mb-3">
  <label className="form-label">Main Export Market(s)</label>
  <select
    multiple
    className="form-select"
    name="tradeInformation.mainExportMarkets"
    value={formData.tradeInformation?.mainExportMarkets || []}
    onChange={(e) => {
      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({
        ...prev,
        tradeInformation: {
          ...prev.tradeInformation,
          mainExportMarkets: selected,
        },
      }));
    }}
  >
    <option value="Asia">Asia</option>
    <option value="Europe">Europe</option>
    <option value="North America">North America</option>
    <option value="South America">South America</option>
    <option value="Africa">Africa</option>
    <option value="Australia">Australia</option>
    <option value="Middle East">Middle East</option>
    <option value="Eastern Europe">Eastern Europe</option>
    <option value="Western Europe">Western Europe</option>
    <option value="Central America">Central America</option>
  </select>
  <small className="text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</small>
</div>


                <div className="mb-3">
                  <label className="form-label">Certifications</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tradeInformation.certifications"
                    value={formData.tradeInformation?.certifications || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Packaging Details</label>
                <textarea
                  className="form-control"
                  name="tradeInformation.packagingDetails"
                  value={formData.tradeInformation?.packagingDetails || ""}
                  onChange={handleChange}
                  rows="2"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Payment Terms</label>
                  <select
                    className="form-control"
                    name="tradeInformation.paymentTerms"
                    value={formData.tradeInformation?.paymentTerms || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="T/T">T/T</option>
                    <option value="L/C">L/C</option>
                    <option value="D/P">D/P</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Main Domestic Market</label>
                  <select
                    className="form-control"
                    name="tradeInformation.mainDomesticMarket"
                    value={formData.tradeInformation?.mainDomesticMarket || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="All India">All India</option>
                    <option value="North India">North India</option>
                    <option value="South India">South India</option>
                    <option value="East India">East India</option>
                    <option value="West India">West India</option>
                  </select>
                </div>
              </div>

              <h5 className="mt-3">Product Specifications</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Product Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.productType"
                    value={formData.specifications?.productType || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Material</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.material"
                    value={formData.specifications?.material || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Finish</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.finish"
                    value={formData.specifications?.finish || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Thickness</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="specifications.thickness"
                      value={formData.specifications?.thickness || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="specifications.thicknessUnit"
                      value={formData.specifications?.thicknessUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Thickness Tolerance</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="specifications.thicknessTolerance"
                      value={formData.specifications?.thicknessTolerance || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="specifications.thicknessToleranceUnit"
                      value={formData.specifications?.thicknessToleranceUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Width</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="specifications.width"
                      value={formData.specifications?.width || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="specifications.widthUnit"
                      value={formData.specifications?.widthUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Width Tolerance</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="specifications.widthTolerance"
                      value={formData.specifications?.widthTolerance || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="specifications.widthToleranceUnit"
                      value={formData.specifications?.widthToleranceUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Length</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="specifications.length"
                      value={formData.specifications?.length || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="specifications.lengthUnit"
                      value={formData.specifications?.lengthUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="meter">meter</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Weight</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="specifications.weight"
                      value={formData.specifications?.weight || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="specifications.weightUnit"
                      value={formData.specifications?.weightUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Metals Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.metalsType"
                    value={formData.specifications?.metalsType || ""}
                    onChange={(e) => {
                      // Assuming comma-separated values for multiple metals
                      setFormData((prev) => ({
                        ...prev,
                        specifications: {
                          ...prev.specifications,
                          metalsType: e.target.value.split(",").map(s => s.trim()),
                        },
                      }));
                    }}
                    placeholder="e.g., Gold, Silver"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Shape</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.shape"
                    value={formData.specifications?.shape || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Size</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.size"
                    value={formData.specifications?.size || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Product Name (Specification)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.productName"
                    value={formData.specifications?.productName || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.color"
                    value={formData.specifications?.color || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Coating</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.coating"
                    value={formData.specifications?.coating || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Wood Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.woodType"
                    value={formData.specifications?.woodType || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Usage</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.usage"
                    value={formData.specifications?.usage || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Processor Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.processorType"
                    value={formData.specifications?.processorType || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Type (Specification)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.type"
                    value={formData.specifications?.type || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Design</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.design"
                    value={formData.specifications?.design || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Feature</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.feature"
                    value={formData.specifications?.feature || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Metal Type (Specification)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.metalType"
                    value={formData.specifications?.metalType || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Application</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.application"
                    value={formData.specifications?.application || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Finishing (Specification)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.finishing"
                    value={formData.specifications?.finishing || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Origin</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.origin"
                    value={formData.specifications?.origin || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Finish Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.finishType"
                    value={formData.specifications?.finishType || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Installation Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.installationType"
                    value={formData.specifications?.installationType || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Other Material</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.otherMaterial"
                    value={formData.specifications?.otherMaterial || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cover Material</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specifications.coverMaterial"
                    value={formData.specifications?.coverMaterial || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="foldableCheck"
                      name="specifications.foldable"
                      checked={formData.specifications?.foldable || false}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="foldableCheck">Foldable</label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Trade Shopping Details */}
          {selectedField === "tradeShopping" && (
            <>
              <h5 className="mt-3">Trade Shopping Details</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Brand Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tradeShopping.brandName"
                    value={formData.tradeShopping?.brandName || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">GST</label>
                  <select
                    className="form-control"
                    name="tradeShopping.gst"
                    value={formData.tradeShopping?.gst || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Selling Price Type</label>
                <select
                  className="form-control"
                  name="tradeShopping.sellingPriceType"
                  value={formData.tradeShopping?.sellingPriceType || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Slab Based">Slab Based</option>
                </select>
              </div>

              {formData.tradeShopping?.sellingPriceType === "Fixed" && (
                <div className="mb-3">
                  <label className="form-label">Fixed Selling Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.fixedSellingPrice"
                    value={formData.tradeShopping?.fixedSellingPrice || ""}
                    onChange={handleChange}
                  />
                </div>
              )}

              {formData.tradeShopping?.sellingPriceType === "Slab Based" && (
                <div className="mb-3">
                  <label className="form-label">Slab Pricing</label>
                  {formData.tradeShopping.slabPricing.map((slab, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min Quantity"
                        value={slab.minQuantity}
                        onChange={(e) => {
                          const newSlabPricing = [...formData.tradeShopping.slabPricing];
                          newSlabPricing[index].minQuantity = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            tradeShopping: { ...prev.tradeShopping, slabPricing: newSlabPricing },
                          }));
                        }}
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Max Quantity"
                        value={slab.maxQuantity}
                        onChange={(e) => {
                          const newSlabPricing = [...formData.tradeShopping.slabPricing];
                          newSlabPricing[index].maxQuantity = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            tradeShopping: { ...prev.tradeShopping, slabPricing: newSlabPricing },
                          }));
                        }}
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Price"
                        value={slab.price}
                        onChange={(e) => {
                          const newSlabPricing = [...formData.tradeShopping.slabPricing];
                          newSlabPricing[index].price = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            tradeShopping: { ...prev.tradeShopping, slabPricing: newSlabPricing },
                          }));
                        }}
                      />
                      <Button variant="danger" onClick={() => {
                        const newSlabPricing = formData.tradeShopping.slabPricing.filter((_, i) => i !== index);
                        setFormData((prev) => ({
                          ...prev,
                          tradeShopping: { ...prev.tradeShopping, slabPricing: newSlabPricing },
                        }));
                      }}>Remove</Button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      tradeShopping: {
                        ...prev.tradeShopping,
                        slabPricing: [...prev.tradeShopping.slabPricing, { minQuantity: "", maxQuantity: "", price: "" }],
                      },
                    }));
                  }}>Add Slab</Button>
                </div>
              )}

<div className="row">
      <div className="col-12 mb-3">
                <label className="form-label">MRP</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.mrp"
                    value={formData.tradeShopping?.mrp || ""}
                    onChange={handleChange}
                  />
                </div>
</div>
              <div className="row">
              <div className="col-md-6 mb-3">
  <label className="form-label">Unit</label>
  <select
    className="form-select" // Use form-select for Bootstrap styling if applicable
    name="tradeShopping.unit"
    value={formData.tradeShopping?.unit || ""}
    onChange={handleChange}
  >
    <option value="">Select Unit</option>
    <option value="kg">kg</option>
    <option value="liter">liter</option>
    <option value="piece">piece</option>
  </select>
</div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Pack Size</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.packSize"
                    value={formData.tradeShopping?.packSize || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Min Ordered Packs</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.minOrderedPacks"
                    value={formData.tradeShopping?.minOrderedPacks || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Is Returnable</label>
                  <select
                    className="form-control"
                    name="tradeShopping.isReturnable"
                    value={formData.tradeShopping?.isReturnable || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.stockQuantity"
                    value={formData.tradeShopping?.stockQuantity || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Weight Per Unit</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="tradeShopping.weightPerUnit"
                      value={formData.tradeShopping?.weightPerUnit || ""}
                      onChange={handleChange}
                    />
                    <select
                      className="form-select"
                      name="tradeShopping.weightUnit"
                      value={formData.tradeShopping?.weightUnit || ""}
                      onChange={handleChange}
                    >
                      <option value="">Unit</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Shipping Type</label>
                <select
                  className="form-control"
                  name="tradeShopping.shippingType"
                  value={formData.tradeShopping?.shippingType || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Free">Free</option>
                  <option value="Flat Rate">Flat Rate</option>
                  <option value="% of Order Value">% of Order Value</option>
                  <option value="Actual">Actual</option>
                </select>
              </div>

              <h6 className="mt-3">Package Dimensions</h6>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Length</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.packageDimensions.length"
                    value={formData.tradeShopping?.packageDimensions?.length || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Width</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.packageDimensions.width"
                    value={formData.tradeShopping?.packageDimensions?.width || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Height</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tradeShopping.packageDimensions.height"
                    value={formData.tradeShopping?.packageDimensions?.height || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Dimension Unit</label>
                <select
                  className="form-control"
                  name="tradeShopping.packageDimensions.unit"
                  value={formData.tradeShopping?.packageDimensions?.unit || "cm"}
                  onChange={handleChange}
                >
                  <option value="cm">cm</option>
                  <option value="inch">inch</option>
                </select>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default AllProducts;