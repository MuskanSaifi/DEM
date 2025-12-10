import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Tab, Nav } from "react-bootstrap";
import Image from "next/image";
import { Country, State, City } from 'country-state-city';
import Link from "next/link";


// Slug generator function
const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

const AddProduct = () => {

const [selectedCountry, setSelectedCountry] = useState("");
const [availableStates, setAvailableStates] = useState([]);
const [availableCities, setAvailableCities] = useState([]);

    // category
    const [selectedCategory, setSelectedCategory] = useState([]);

    // Products
        const [product, setProduct] = useState({
            name: "",
            productslug: "",
            category: "",
            subCategory: "",
            price: "",
            currency: "",
            minimumOrderQuantity: "",
            moqUnit: "",
            description: "",
            country: "",
            state: "",
            city: "",

            stockQuantity: "",
            images: [],
            // ✅ Trade Information (Fix enum defaults)
            tradeInformation: {
                supplyAbility: "",
                deliveryTime: "",
                fobPort: "",
                samplePolicy: "",
                sampleAvailable: "No", // ✅ Default value
                mainExportMarkets: "",
                certifications: "",
                packagingDetails: "",
                paymentTerms: "",
                mainDomesticMarket: "",
            },

            // ✅ Product Specifications
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
                metalsType: "",
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
                foldable: ""
            },

        // ✅ Trade Shopping (Updated for Slab Pricing)
        tradeShopping: {
            brandName: "",
            gst: "",
            sellingPriceType: "", // ✅ Default value
            fixedSellingPrice: "", // ✅ Fixed Price Field
            slabPricing: [
                // ✅ Example Default Entry for Slab Pricing
                { minQuantity: "", maxQuantity: "", price: "" }
            ],
            unit: "",
            packSize: "",
            minOrderedPacks: "",
            isReturnable: "",
            stockQuantity: "",
            weightPerUnit: "",
            weightUnit: "kg", // ✅ Default unit
            shippingType: "Free",
            packageDimensions: {
                length: "",
                width: "",
                height: "",
                unit: "cm", // ✅ Default unit
            },
        },
        });

   // Handle country change
        const handleCountryChange = (e) => {
          const countryCode = e.target.value;
          setSelectedCountry(countryCode);
        
          setProduct((prev) => ({
            ...prev,
            country: countryCode, // ✅ This is perfect
            state: "",
            city: "",
          }));
        
          const states = State.getStatesOfCountry(countryCode);
          setAvailableStates(states);
          setAvailableCities([]);
        };
  
          
  // Handle state change
          const handleStateChange = (e) => {
            const stateCode = e.target.value;
            setProduct((prev) => ({
              ...prev,
              state: stateCode,
              city: "", // Reset city
            }));
          
            const cities = City.getCitiesOfState(selectedCountry, stateCode);
            setAvailableCities(cities);
          };
          
  // Handle city change
  const handleCityChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      city: e.target.value,
    }));
  };
  
    // fetch category
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const result = await axios.get(`/api/adminprofile/category`); // ✅ Use the correct route
            setSelectedCategory(result.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const [loading, setLoading] = useState(false);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
      
        if (name === "name") {
          const productslug = generateSlug(value);
          setProduct((prev) => ({ ...prev, name: value, productslug }));
        } else {
          setProduct((prev) => ({ ...prev, [name]: value }));
        }
      };
      
    const handleNestedChange = (e, field, subField = null) => {
        const { name, value, type } = e.target;
    
        let newValue = type === "number" ? (value ? Number(value) : null) : value; 
    
        setProduct((prev) => ({
            ...prev,
            [field]: {
                ...prev[field],
                ...(subField
                    ? {
                        [subField]: {
                            ...prev[field][subField],
                            [name]: newValue,
                        },
                    }
                    : {
                        [name]: newValue,
                    }),
            },
        }));
    };
      
      const updateSlabPricing = (index, key, value) => {
        const updatedSlabs = [...product.tradeShopping.slabPricing];
        updatedSlabs[index][key] = value;
        setProduct((prev) => ({
          ...prev,
          tradeShopping: { ...prev.tradeShopping, slabPricing: updatedSlabs },
        }));
      };
      
      const addNewSlab = () => {
        setProduct((prev) => ({
          ...prev,
          tradeShopping: {
            ...prev.tradeShopping,
            slabPricing: [...prev.tradeShopping.slabPricing, { minQuantity: "", maxQuantity: "", price: "" }],
          },
        }));
      };
      
      const removeSlab = (index) => {
        const updatedSlabs = product.tradeShopping.slabPricing.filter((_, i) => i !== index);
        setProduct((prev) => ({
          ...prev,
          tradeShopping: { ...prev.tradeShopping, slabPricing: updatedSlabs },
        }));
      };


      const handleImageChange = async (e) => {
        const files = e.target.files;
        if (!files.length) return;
        if (files.length + product?.images?.length > 6) {
            toast.error("You can upload a maximum of 6 images.");
            return;
        }
    
        const imagePromises = Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            });
        });
    
        try {
            const base64Images = await Promise.all(imagePromises);
            setProduct((prev) => ({ ...prev, images: [...prev.images, ...base64Images] }));
        } catch (error) {
            toast.error("Error processing images.");
        }
    };
    
const handleSubmit = async (e) => {
    e.preventDefault();
      // ✅ Manual validation for required fields
  if (!product.category) {
    toast.error("Please select a category.");
    return;
  }

  if (!product.subCategory) {
    toast.error("Please select a subcategory.");
    return;
  }

    setLoading(true);

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("User not authenticated");
            setLoading(false);
            return;
        }

        const formattedProduct = {
            ...product,
            images: product?.images.map((img) => ({ url: img })),  // ✅ Convert strings to objects
            specifications: {
                ...product.specifications,
                weight: Number(product.specifications.weight) || 0,
                metalsType: Array.isArray(product.specifications.metalsType)
                    ? product.specifications.metalsType
                    : [],
                foldable: product.specifications.foldable === "Yes",
            },
            tradeInformation: {
                ...product.tradeInformation,
                mainExportMarkets: product.tradeInformation.mainExportMarkets
                    ? product.tradeInformation.mainExportMarkets.split(",").map((m) => m.trim())
                    : [],
            },
            tradeShopping: {
                ...product.tradeShopping,
                fixedSellingPrice: Number(product.tradeShopping.fixedSellingPrice) || null,  
                packageDimensions: {
                    length: product.tradeShopping.packageDimensions.length 
                        ? Number(product.tradeShopping.packageDimensions.length) 
                        : null,
                    width: product.tradeShopping.packageDimensions.width 
                        ? Number(product.tradeShopping.packageDimensions.width) 
                        : null,
                    height: product.tradeShopping.packageDimensions.height 
                        ? Number(product.tradeShopping.packageDimensions.height) 
                        : null,
                    unit: product.tradeShopping.packageDimensions.unit || "cm",
                },
            },
        };
      
        const response = await axios.post(
            `/api/userprofile/manageproducts`,
            formattedProduct,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data.success) {
            toast.success("Product created successfully!");
        } else {
            toast.error(`${response.data.message || "Failed to create product."}`);
        }
    } catch (error) {
        console.error("❌ Error submitting product:", error);

        if (error.response) {
          // If the server responded with an error (like missing fields)
          toast.error(error.response.data.message || "Image Size Should be Less than 500 KB");
        } else if (error.request) {
          // If no response was received from the server
          toast.error("❌ No response from server. Please check your internet connection.");
        } else {
          // General error during request setup
          toast.error("❌ Error setting up the request. Please try again.");
        }
    } finally {
        setLoading(false);
    }
};  

    return (
        <div className="container mt-4">
            <Tab.Container defaultActiveKey="basicDetails">
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="basicDetails">Basic Details</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="description">Description</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="specifications">Specifications</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="tradeShopping">Trade Shopping</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Basic Details */}
                    <Tab.Pane eventKey="basicDetails">
                        <div className="bg-white p-4 rounded-lg max-w-[100%]">

                            <div className="mb-3">
                                <label className="text-gray-600 text-sm">Product Name</label>
                                <div className="relative mt-2 text-gray-500">
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
  <label className="text-gray-600 text-sm">Product Slug</label>
  <div className="relative mt-2 text-gray-500">
    <input
      type="text"
      className="w-full pl-3 pr-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
      name="productslug"
      value={product.productslug}
      onChange={handleChange}
      required
      readOnly
      disabled
    />
  </div>
</div>
                            <div className="mb-3 flex gap-4">
                                {/* Category Dropdown */}
                                <div className="w-1/2">
                                    <label className="text-gray-600 text-sm">Category</label>
                                    <div className="relative mt-2 text-gray-500">
                                        <select
                                            className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                            id="product-category"
                                            value={product.category}
                                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {selectedCategory.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Subcategory Dropdown */}
                                <div className="w-1/2">
                                    <label className="text-gray-600 text-sm">Subcategory</label>
                                    <div className="relative mt-2 text-gray-500">
                                        <select
                                            className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                            id="product-subcategory"
                                            value={product.subCategory}
                                            onChange={(e) => setProduct({ ...product, subCategory: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Subcategory</option>
                                            {selectedCategory
                                                .find((cat) => cat._id === product.category)
                                                ?.subcategories?.map((sub) => (
                                                    <option key={sub._id} value={sub._id}>
                                                        {sub.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3 flex gap-4">
                                {/* Price Section */}
                                <div className="w-1/2">
                                    <label className="text-gray-600 text-sm">Price</label>
                                    <div className="relative mt-2 text-gray-500">
                                        {/* Price Input Field */}
                                        <input
                                            type="number"
                                            className="w-full pr-[6rem] pl-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                            name="price"
                                            value={product.price}
                                            onChange={handleChange}
                                            required
                                        />

                                        {/* Currency Dropdown on the Right */}
                                        <div className="absolute inset-y-0 right-3 my-auto flex items-center border-l pl-2">
                                            <select
                                                className="text-sm bg-transparent outline-none h-full appearance-none"
                                                name="currency"
                                                value={product.currency}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="AUD">AUD (A$)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* MOQ Section */}
                                <div className="w-1/2">
                                    <label className="text-gray-600 text-sm">Minimum Order Quantity</label>
                                    <div className="relative mt-2 text-gray-500">
                                        {/* MOQ Input Field */}
                                        <input
                                            type="number"
                                            className="w-full pr-[7rem] pl-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                            name="minimumOrderQuantity"
                                            value={product.minimumOrderQuantity}
                                            onChange={handleChange}
                                            required
                                        />
                                        {/* Unit Dropdown on the Right */}
                                        <div className="absolute inset-y-0 right-3 my-auto flex items-center border-l pl-2">
                                            <select
                                                className="text-sm bg-transparent outline-none h-full appearance-none"
                                                name="moqUnit"
                                                value={product.moqUnit}
                                                onChange={handleChange}
                                                required
                                            >
  <option value="Kilograms">Kg</option>
<option value="Grams">Gram</option>
<option value="Metric Tons">Metric Ton</option>
<option value="Ton/Tons">Ton</option>
<option value="Piece">Piece</option>
<option value="Pieces">Pieces</option>
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
<option value="Square Feet">Sq. Ft</option>
<option value="Square Meter">Sq. Mtr</option>
<option value="Cubic Feet">Cu. Ft</option>
<option value="Cubic Meter">Cu. Mtr</option>
<option value="Liter/Liters">Liter</option>
<option value="Milliliter">Milliliter</option>
<option value="Gallon/Gallons">Gallon</option>
<option value="Barrel/Barrels">Barrel</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="mb-3">
                      <label className="text-gray-600 text-sm">
                        Product Images (Max 6, each less than 500KB)
                         <Link href="https://www.iloveimg.com/compress-image" target="blank"> click here to compress image</Link>
                      </label>
                       <input type="file" className="form-control" name="images" onChange={handleImageChange} accept="image/*" multiple />
                                {product?.images?.length > 0 && (
                                    <div className="mt-2 d-flex">
                                        {product?.images.map((img, index) => (
<Image
  key={index}
  src={img || "/placeholder.png"}
  alt={`Preview ${index}`}
  width={50}
  height={50}
  className="mr-2 rounded"
/>

))}
                                    </div>
                                )}
                            </div>

                    <div>
  

  {/* Country Dropdown */}
<div className="mb-3">
  <label className="text-gray-600 text-sm">Country</label>
  <select
    className="w-full pl-3 pr-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
    value={product.country}
    onChange={handleCountryChange}
  >
    <option value="">Select Country</option>
    {Country.getAllCountries().map((country) => (
      <option key={country.isoCode} value={country.isoCode}>
        {country.name}
      </option>
    ))}
  </select>
</div>

{/* State Dropdown */}
<div className="mb-3">
  <label className="text-gray-600 text-sm">State</label>
  <select
    className="w-full pl-3 pr-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
    value={product.state}
    onChange={handleStateChange}
    disabled={!selectedCountry}
  >
    <option value="">Select State</option>
    {availableStates.map((state) => (
      <option key={state.isoCode} value={state.isoCode}>
        {state.name}
      </option>
    ))}
  </select>
</div>

{/* City Dropdown */}
<div className="mb-3">
  <label className="text-gray-600 text-sm">City</label>
  <select
    className="w-full pl-3 pr-3 py-2 appearance-none bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
    value={product.city}
    onChange={handleCityChange}
    disabled={!product.state}
  >
    <option value="">Select City</option>
    {availableCities.map((city, index) => (
      <option key={index} value={city.name}>
        {city.name}
      </option>
    ))}
  </select>
</div>
    </div>

                        </div>
                    </Tab.Pane>

                    {/* Description */}
                    <Tab.Pane eventKey="description">
                        <div className="mb-3">
                            <label className="text-gray-600 text-sm">Description</label>
                            <textarea className="form-control" name="description" value={product.description} onChange={handleChange}></textarea>
                        </div>
                    </Tab.Pane>

                    {/* Specifications */}
                    <Tab.Pane eventKey="specifications">
                        <div className="bg-white p-4 rounded-lg w-full">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Specifications</h3>

                            {/* Grid Layout for 2 Columns */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Product Type */}
                                <div>
                                    <label className="text-gray-600 text-sm">Product Type</label>
                                    <select
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="productType"
                                        value={product.specifications.productType}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        required
                                    >
                                   <option value="">Select Product Type</option>

{/* <!-- Industrial Products --> */}
<option value="Industrial Machinery">Industrial Machinery</option>
<option value="Tools & Equipment">Tools & Equipment</option>
<option value="Electrical Goods">Electrical Goods</option>
<option value="Electronic Components">Electronic Components</option>
<option value="Power & Energy">Power & Energy</option>
<option value="Construction Equipment">Construction Equipment</option>
<option value="Hydraulics & Pneumatics">Hydraulics & Pneumatics</option>

{/* <!-- Home & Furniture --> */}
<option value="Furniture">Furniture</option>
<option value="Home Decor">Home Decor</option>
<option value="Lighting Products">Lighting Products</option>
<option value="Kitchenware & Cookware">Kitchenware & Cookware</option>
<option value="Bathroom Accessories">Bathroom Accessories</option>
<option value="Home Appliances">Home Appliances</option>

{/* <!-- Fashion & Apparel --> */}
<option value="Men Clothing">Men Clothing</option>
<option value="Women Clothing">Women Clothing</option>
<option value="Kids Wear">Kids Wear</option>
<option value="Footwear">Footwear</option>
<option value="Bags & Luggage">Bags & Luggage</option>
<option value="Textiles & Fabrics">Textiles & Fabrics</option>
<option value="Fashion Accessories">Fashion Accessories</option>

{/* <!-- Food & Agriculture --> */}
<option value="Food & Beverages">Food & Beverages</option>
<option value="Spices & Condiments">Spices & Condiments</option>
<option value="Fruits & Vegetables">Fruits & Vegetables</option>
<option value="Dairy Products">Dairy Products</option>
<option value="Agricultural Equipment">Agricultural Equipment</option>
<option value="Seeds & Fertilizers">Seeds & Fertilizers</option>

{/* <!-- Chemicals & Minerals --> */}
<option value="Chemicals">Chemicals</option>
<option value="Pharmaceutical Raw Materials">Pharmaceutical Raw Materials</option>
<option value="Fertilizers & Pesticides">Fertilizers & Pesticides</option>
<option value="Metals & Minerals">Metals & Minerals</option>
<option value="Plastic & Rubber">Plastic & Rubber</option>

{/* <!-- Handicrafts & Gifts --> */}
<option value="Handicrafts">Handicrafts</option>
<option value="Marble & Stone Items">Marble & Stone Items</option>
<option value="Religious Statues">Religious Statues</option>
<option value="Decorative Items">Decorative Items</option>
<option value="Gifts & Souvenirs">Gifts & Souvenirs</option>

{/* <!-- Electronics & Mobile --> */}
<option value="Mobiles & Accessories">Mobiles & Accessories</option>
<option value="Computers & Laptops">Computers & Laptops</option>
<option value="Security Systems">Security Systems</option>
<option value="CCTV & Surveillance">CCTV & Surveillance</option>
<option value="Consumer Electronics">Consumer Electronics</option>

{/* <!-- Beauty & Personal Care --> */}
<option value="Cosmetics & Beauty Products">Cosmetics & Beauty Products</option>
<option value="Personal Care Products">Personal Care Products</option>
<option value="Health & Wellness">Health & Wellness</option>
<option value="Medicines & Drugs">Medicines & Drugs</option>

{/* <!-- Automobile & Transportation --> */}
<option value="Automobile Parts">Automobile Parts</option>
<option value="Bikes & Scooters">Bikes & Scooters</option>
<option value="Cars & Vehicles">Cars & Vehicles</option>
<option value="Tyres & Tubes">Tyres & Tubes</option>
<option value="Transport Services">Transport Services</option>

{/* <!-- Packaging & Printing --> */}
<option value="Packaging Materials">Packaging Materials</option>
<option value="Printing Services">Printing Services</option>
<option value="Labels & Stickers">Labels & Stickers</option>
<option value="Paper Products">Paper Products</option>

{/* <!-- Construction & Real Estate --> */}
<option value="Building Materials">Building Materials</option>
<option value="Cement & Sand">Cement & Sand</option>
<option value="Tiles & Flooring">Tiles & Flooring</option>
<option value="Real Estate">Real Estate</option>

{/* <!-- Services --> */}
<option value="IT Services">IT Services</option>
<option value="Web Development">Web Development</option>
<option value="Digital Marketing">Digital Marketing</option>
<option value="Consultancy Services">Consultancy Services</option>
<option value="Education & Training">Education & Training</option>
<option value="Financial Services">Financial Services</option>

{/* <!-- Miscellaneous --> */}
<option value="Toys & Games">Toys & Games</option>
<option value="Sports Goods">Sports Goods</option>
<option value="Pet Products">Pet Products</option>
<option value="Stationery">Stationery</option>
<option value="Gems & Jewelry">Gems & Jewelry</option>
<option value="Leather Products">Leather Products</option>
<option value="Safety Equipment">Safety Equipment</option>
<option value="Other">Other</option>

                                    </select>
                                </div>

                                {/* Material */}
                                <div>
                                    <label className="text-gray-600 text-sm">Material</label>
                                    <select
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="material"
                                        value={product.specifications.material}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        required
                                    >
                                     <option value="">Select Material</option>
<option value="Acrylic">Acrylic</option>
<option value="Aluminum">Aluminum</option>
<option value="Bamboo">Bamboo</option>
<option value="Brass">Brass</option>
<option value="Bronze">Bronze</option>
<option value="Canvas">Canvas</option>
<option value="Ceramic">Ceramic</option>
<option value="Clay">Clay</option>
<option value="Copper">Copper</option>
<option value="Cotton">Cotton</option>
<option value="Fabric">Fabric</option>
<option value="Fiber">Fiber</option>
<option value="Foam">Foam</option>
<option value="Glass">Glass</option>
<option value="Iron">Iron</option>
<option value="Jute">Jute</option>
<option value="Leather">Leather</option>
<option value="Marble">Marble</option>
<option value="Metal">Metal</option>
<option value="Paper">Paper</option>
<option value="Plastic">Plastic</option>
<option value="Polyresin">Polyresin</option>
<option value="PVC">PVC</option>
<option value="Resin">Resin</option>
<option value="Silk">Silk</option>
<option value="Stainless Steel">Stainless Steel</option>
<option value="Stone">Stone</option>
<option value="Terracotta">Terracotta</option>
<option value="Velvet">Velvet</option>
<option value="Wood">Wood</option>
<option value="Wool">Wool</option>
<option value="Zinc">Zinc</option>
<option value="Other">Other</option>

                                    </select>
                                </div>

                                {/* Finish */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="finish"
                                        placeholder="Finish"
                                        value={product.specifications.finish}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* Thickness Tolerance & Unit */}
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full pl-3 pr-3  bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="thicknessTolerance"
                                        value={product.specifications.thicknessTolerance}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        placeholder="Thickness Tolerance"
                                        min="0" // Prevents negative values
                                        step="any" // Allows decimal values
                                    />
                                    <select
                                        className="w-1/3 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="thicknessToleranceUnit"
                                        value={product.specifications.thicknessToleranceUnit}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    >
                                        <option value="">Select</option>
                                        <option value="Meter">Meter</option>
                                        <option value="Micrometers (um)">Micrometers (um)</option>
                                        <option value="Gauge">Gauge</option>
                                        <option value="Feet (ft)">Feet (ft)</option>
                                    </select>
                                </div>

                                {/* Width & Unit */}
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="width"
                                        value={product.specifications.width}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        placeholder="Width"
                                        min="0" // Prevents negative values
                                        step="any" // Allows decimal values
                                    />
                                    <select
                                        className="w-1/3 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="widthUnit"
                                        value={product.specifications.widthUnit}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    >
                                        <option value="">Select</option>
                                        <option value="Meter">Meter</option>
                                        <option value="Centimeter">Centimeter</option>
                                    </select>
                                </div>

                                {/* Length & Unit */}
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="length"
                                        value={product.specifications.length}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        placeholder="Length"
                                        min="0" // Prevents negative values
                                        step="any" // Allows decimal values
                                    />
                                    <select
                                        className="w-1/3 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="lengthUnit"
                                        value={product.specifications.lengthUnit}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    >
                                        <option value="">Select</option>
                                        <option value="Meter">Meter</option>
                                        <option value="Centimeter">Centimeter</option>
                                    </select>
                                </div>

                                {/* Weight & Unit */}
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        className="w-full h-[42px] pl-3 pr-3 py-2 bg-white outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="weight"
                                        value={product.specifications.weight}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        placeholder="Weight"
                                        min="0" // Prevents negative values
                                        step="any" // Allows decimal values
                                    />
                                    <select
                                        className="w-1/3 h-[42px] bg-white outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="weightUnit"
                                        value={product.specifications.weightUnit}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    >
                                        <option value="">Select</option>
                                        <option value="Kilograms">Kg</option>
                                        <option value="Grams">Grams</option>
                                        <option value="Mg">Mg</option>
                                    </select>
                                </div>

                                {/* Metals Type (Multi-Select) */}
                                <div>
                                    <label className="text-gray-600 text-sm">Metals Type</label>
                                    <select
                                        className="w-full min-h-[42px] pl-3 pr-3 py-2 bg-white outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="metalsType"
                                        multiple
                                        value={Array.isArray(product.specifications.metalsType) ? product.specifications.metalsType : []} // ✅ Ensures value is always an array
                                        onChange={(e) =>
                                            handleNestedChange(
                                                { target: { name: "metalsType", value: [...e.target.selectedOptions].map((o) => o.value) } },
                                                "specifications"
                                            )
                                        }
                                        size="5" // Ensures at least 5 options are visible
                                    >
                                        <option value="Aluminum">Aluminum</option>
                                        <option value="Zinc Alloy">Zinc Alloy</option>
                                        <option value="Iron">Iron</option>
                                        <option value="Steel">Steel</option>
                                        <option value="Stainless Steel">Stainless Steel</option>
                                        <option value="Alloy">Alloy</option>
                                        <option value="Carbon">Carbon</option>
                                    </select>
                                </div>


                                {/* Shape */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="shape"
                                        placeholder="shape"
                                        value={product.specifications.shape}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>


                                {/* Size */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="size"
                                        placeholder="Size"
                                        value={product.specifications.size}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>


                                {/* Product Name */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="productName"
                                        placeholder="Product Name"
                                        value={product.specifications.productName}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>


                                {/* Thickness & Unit */}
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="thickness"
                                        value={product.specifications.thickness}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                        placeholder="Thickness"
                                        min="0" // Prevents negative values
                                        step="any" // Allows decimal values
                                    />
                                    <select
                                        className="w-1/3 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="thicknessUnit"
                                        value={product.specifications.thicknessUnit}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    >
                                        <option value="">Select</option>
                                              <option value="Meter">Meter</option>
                                              <option value="Centimeter (cm)">Centimeter (cm)</option>
                                              <option value="Millimeter (mm)">Millimeter (mm)</option>
                                              <option value="Micrometer (µm)">Micrometer (µm)</option>
                                              <option value="Nanometer (nm)">Nanometer (nm)</option>
                                              <option value="Inch (in)">Inch (in)</option>
                                              <option value="Feet (ft)">Feet (ft)</option>
                                    </select>
                                </div>


                                {/* Color */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="color"
                                        placeholder="Color"
                                        value={product.specifications.color}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>


                                {/* Coating */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="coating"
                                        placeholder="Coating"
                                        value={product.specifications.coating}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* Wood Type */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="woodType"
                                        placeholder="Wood Type"
                                        value={product.specifications.woodType}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* Usage */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="usage"
                                        placeholder="Usage"
                                        value={product.specifications.usage}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* processorType */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="processorType"
                                        placeholder="Processor Type"
                                        value={product.specifications.processorType}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* type */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="type"
                                        placeholder="Type"
                                        value={product.specifications.type}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* design */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="design"
                                        placeholder="Design"
                                        value={product.specifications.design}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>

                                {/* feature */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="feature"
                                        placeholder="feature"
                                        value={product.specifications.feature}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>


                                {/* Application */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full pl-3 pr-3 py-2 bg-transparent outline-none border focus:border-slate-600 shadow-sm rounded-lg"
                                        name="application"
                                        placeholder="Application"
                                        value={product.specifications.application}
                                        onChange={(e) => handleNestedChange(e, "specifications")}
                                    />
                                </div>
                            </div>
                        </div>
                    </Tab.Pane>


                    {/* Trade Shopping */}
                    <Tab.Pane eventKey="tradeShopping">
  <div className="bg-white p-4 rounded-lg w-full">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Trade Shopping Details</h3>

    {/* Grid Layout for 2 Columns */}
    <div className="grid grid-cols-2 gap-4">
      {/* Brand Name */}
      <div>
        <label className="text-gray-600 text-sm">Brand Name</label>
        <input
          type="text"
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="brandName"
          value={product.tradeShopping.brandName}
          onChange={(e) => handleNestedChange(e, "tradeShopping")}
        />
      </div>

      {/* GST (%) */}
      <div>
        <label className="text-gray-600 text-sm">GST (%)</label>
        <select
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="gst"
          value={product.tradeShopping.gst}
          onChange={(e) =>
            handleNestedChange({ target: { name: "gst", value: Number(e.target.value) } }, "tradeShopping")
          }          
        >
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
      </div>

      {/* Selling Price Type */}
      <div className="col-span-2">
        <label className="text-gray-600 text-sm">Selling Price Type</label>
        <select
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="sellingPriceType"
          value={product.tradeShopping.sellingPriceType}
          onChange={(e) => handleNestedChange(e, "tradeShopping")}
        >
          <option value="Fixed">Fixed</option>
          <option value="Slab Based">Slab Based</option>
        </select>
      </div>

      {/* Show Selling Price only for Fixed Price */}
      {/* {product.tradeShopping.sellingPriceType === "Fixed" && (
        <div>
        <label className="text-gray-600 text-sm">fixed Selling Price</label>
        <input
          type="number"
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="fixedSellingPrice"
          placeholder="MRP of 1 unit (with GST and in Rupees only)"
          value={product.tradeShopping.fixedSellingPrice}
          onChange={(e) => handleNestedChange(e, "tradeShopping")}
        />
        </div>
      )} */}

      {/* Slab-Based Pricing Fields */}
      {product.tradeShopping.sellingPriceType === "Slab Based" && (
        <div className="col-span-2">
          <label className="text-gray-600 text-sm">Slab-Based Pricing</label>

          {product.tradeShopping.slabPricing.map((slab, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mt-2">
              <input
                type="number"
                placeholder="Min Quantity"
                className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
                value={slab.minQuantity}
                onChange={(e) => updateSlabPricing(index, "minQuantity", e.target.value)}
              />
              <input
                type="number"
                placeholder="Max Quantity"
                className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
                value={slab.maxQuantity}
                onChange={(e) => updateSlabPricing(index, "maxQuantity", e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
                value={slab.price}
                onChange={(e) => updateSlabPricing(index, "price", e.target.value)}
              />
              <button
                className="text-red-500 font-bold px-3 py-2 bg-gray-100 rounded-lg"
                onClick={() => removeSlab(index)}
              >
                ❌
              </button>
            </div>
          ))}

          <button
            className="mt-2 px-4 py-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
            onClick={addNewSlab}
          >
            ➕ Add More Slabs
          </button>
        </div>
      )}

{/* fixed Selling Price */}
      <div>
        <label className="text-gray-600 text-sm">fixed Selling Price</label>
        <input
          type="number"
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="fixedSellingPrice"
          placeholder="MRP of 1 unit (with GST and in Rupees only)"
          value={product.tradeShopping.fixedSellingPrice}
          onChange={(e) => handleNestedChange(e, "tradeShopping")}
        />
      </div>

{/* Unit Dropdown */}
<div>
  <label className="text-gray-600 text-sm">Unit</label>
  <select
    className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
    name="unit"
    value={product.tradeShopping.unit}
    onChange={(e) => handleNestedChange(e, "tradeShopping")}
  >
<option value="">Select Unit</option>
<option value="Kilograms/Kilograms">Kilograms/Kilograms</option>
<option value="Grams">Grams</option>
<option value="Metric Tons">Metric Tons</option>
<option value="Ton/Tons">Ton/Tons</option>
<option value="Piece">Piece</option>
<option value="Pieces">Pieces</option>
<option value="Unit/Units">Unit/Units</option>
<option value="Dozen">Dozen</option>
<option value="Pair/Pairs">Pair/Pairs</option>
<option value="Set/Sets">Set/Sets</option>
<option value="Box/Boxes">Box/Boxes</option>
<option value="Carton/Cartons">Carton/Cartons</option>
<option value="Bag/Bags">Bag/Bags</option>
<option value="Roll/Rolls">Roll/Rolls</option>
<option value="Sheet/Sheets">Sheet/Sheets</option>
<option value="Meter/Meters">Meter/Meters</option>
<option value="Centimeter">Centimeter</option>
<option value="Inch/Inches">Inch/Inches</option>
<option value="Square Feet">Square Feet</option>
<option value="Square Meter">Square Meter</option>
<option value="Cubic Feet">Cubic Feet</option>
<option value="Cubic Meter">Cubic Meter</option>
<option value="Liter/Liters">Liter/Liters</option>
<option value="Milliliter">Milliliter</option>
<option value="Gallon/Gallons">Gallon/Gallons</option>
<option value="Barrel/Barrels">Barrel/Barrels</option>
  </select>
</div>


      {/* Is Returnable? */}
      <div>
        <label className="text-gray-600 text-sm">Is Returnable?</label>
        <select
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="isReturnable"
          value={product.tradeShopping.isReturnable}
          onChange={(e) => handleNestedChange(e, "tradeShopping")}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>

      {/* Shipping Type */}
      <div>
        <label className="text-gray-600 text-sm">Shipping Type</label>
        <select
          className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
          name="shippingType"
          value={product.tradeShopping.shippingType}
          onChange={(e) => handleNestedChange(e, "tradeShopping")}
        >
          <option value="Free">Free</option>
          <option value="Flat Rate">Flat Rate</option>
          <option value="% of Order Value">% of Order Value</option>
          <option value="Actual">Actual</option>
        </select>
      </div>

{/* Package Dimensions */}
<div className="col-span-2">
  <label className="text-gray-600 text-sm font-medium">
    Package Dimensions <span className="text-red-500">*</span>
  </label>
  <div className="grid grid-cols-4 gap-2 mt-1">
    {/* Length */}
    <input
      type="number"
      placeholder="Length"
      className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
      name="length"
      value={product.tradeShopping.packageDimensions.length}
      onChange={(e) => handleNestedChange(e, "tradeShopping", "packageDimensions")}
    />

    {/* Width */}
    <input
      type="number"
      placeholder="Width"
      className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
      name="width"
      value={product.tradeShopping.packageDimensions.width}
      onChange={(e) => handleNestedChange(e, "tradeShopping", "packageDimensions")}
    />

    {/* Height */}
    <input
      type="number"
      placeholder="Height"
      className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
      name="height"
      value={product.tradeShopping.packageDimensions.height}
      onChange={(e) => handleNestedChange(e, "tradeShopping", "packageDimensions")}
    />

    {/* Unit Dropdown */}
    <select
      className="w-full pl-3 pr-3 py-2 border focus:border-slate-600 shadow-sm rounded-lg"
      name="unit"
      value={product.tradeShopping.packageDimensions.unit}
      onChange={(e) => handleNestedChange(e, "tradeShopping", "packageDimensions")}
    >
      <option value="Inches">Inches</option>
      <option value="cm">cm</option>
    </select>
  </div>
</div>
    </div>
  </div>
</Tab.Pane>
                </Tab.Content>
            </Tab.Container>
            <button type="submit" className="btn btn-primary w-100 mt-3" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Add Product"}
            </button>
        </div>
    );
};
export default AddProduct;
