import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    name: { type: String },
    productslug: { type: String },
    price: { type: Number },
    currency: { type: String, default: "INR" },
    minimumOrderQuantity: { type: Number },
    moqUnit: { type: String, },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    video: { type: String },
    youtubeUrl: { type: String },
    description: { type: String },
country: { type: String, lowercase: true },
    state: {type: String, lowercase: true },
    city: {type: String, lowercase: true },
    cityimage: {type: String},
   
    // for admin
  tags: {
    trending: { type: Boolean, default: false },
    upcoming: { type: Boolean, default: false },
    diwaliOffer: { type: Boolean, default: false },
    holiOffer: { type: Boolean, default: false }
  },

    // ✅ Trade Information
    tradeInformation: {
      supplyAbility: { type: String },
      supplyQuantity: { type:  Number }, // CHANGED TO Number
      deliveryTime: { type: String },
      fobPort: { type: String },
      samplePolicy: { type: String },
      sampleAvailable: { type: String, enum: ["Yes", "No", null], default: null },
      mainExportMarkets: { type: [String] },
      certifications: { type: String },
      packagingDetails: { type: String },
      paymentTerms: { type: String },
      mainDomesticMarket: { type: String },
    },

    // ✅ Specifications - **CRITICAL CHANGES HERE**
    specifications: {
      productType: { type: String },
      material: { type: String },
      finish: { type: String },
      thicknessTolerance: { type: Number }, // CHANGED TO Number
      thicknessToleranceUnit: { type: String },
      width: { type: Number }, // CHANGED TO Number
      widthUnit: { type: String },
      length: { type: Number }, // CHANGED TO Number
      lengthUnit: { type: String },
      weight: { type: Number }, // CHANGED TO Number
      weightUnit: { type: String },
      metalsType: { type: [String], default: [] },
      widthTolerance: { type: Number }, // CHANGED TO Number
      widthToleranceUnit: { type: String },
      shape: { type: String },
      size: { type: String },
      productName: { type: String },
      thickness: { type: Number }, // CHANGED TO Number
      thicknessUnit: { type: String },
      color: { type: String },
      coating: { type: String },
      woodType: { type: String },
      usage: { type: String },
      processorType: { type: String },
      type: { type: String },
      design: { type: String },
      feature: { type: String },
      metalType: { type: String },
      application: { type: String },
      finishing: { type: String },
      origin: { type: String },
      finishType: { type: String },
      installationType: { type: String },
      otherMaterial: { type: String },
      coverMaterial: { type: String },
      foldable: { type: Boolean, default: false },
    },
    
    // ✅ Trade Shopping Details
    tradeShopping: {
      brandName: { type: String },
      gst: { type: Number, enum: [0, 5, 12, 18, 28, null], default: null },
      sellingPriceType: { type: String, enum: ["Fixed", "Slab Based"], default: null }, // Adjusted enum
      fixedSellingPrice: { type: Number },
      slabPricing: [
        {
          minQuantity: { type: Number },
          maxQuantity: { type: Number },
          price: { type: Number },
        },
      ],
      mrp: { type: Number },// Assuming this should be a Number
      unit: { type: String },
      packSize: { type: Number }, // Assuming this should be a Number
      minOrderedPacks: { type: Number }, // Assuming this should be a Number
      isReturnable: { type: String, enum: ["Yes", "No", null], default: null},
      stockQuantity: { type: Number }, // Assuming this should be a Number
stock: { 
  type: String, 
  default: "In stock" 
},

      weightPerUnit: { type: Number }, // Assuming this should be a Number
      weightUnit: { type: String },
      shippingType: {
        type: String,
        enum: ["Free", "Flat Rate", "% of Order Value", "Actual", null],
        default: null,
      },
      packageDimensions: {
        length: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        unit: { type: String, default: "cm" },
    },
    },
    
  },
  { timestamps: true }
);

// ✅ CRITICAL: Indexes for performance optimization
productSchema.index({ city: 1, productslug: 1 }); // Compound index (already exists)
productSchema.index({ name: "text" }); // Text search index
productSchema.index({ city: 1 }); // City queries
productSchema.index({ category: 1 }); // Category queries
productSchema.index({ subCategory: 1 }); // Subcategory queries
productSchema.index({ userId: 1 }); // User products
productSchema.index({ productslug: 1 }); // Slug queries (for single field lookups)
productSchema.index({ country: 1 }); // Country queries
productSchema.index({ state: 1 }); // State queries


export default mongoose.models.Product || mongoose.model("Product", productSchema);