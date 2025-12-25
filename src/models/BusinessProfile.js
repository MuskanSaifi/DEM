const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User Model
    companyName: { type: String },
    officeContact: String,
    faxNumber: String,
    ownershipType: { type: String },
    annualTurnover: { type: String },
    yearOfEstablishment: { type: Number},
    numberOfEmployees: { type: Number},

    // Address Details
    address: { type: String},
    pincode: { type: String},
    city: { type: String},
    state: { type: String},
    country: { type: String},

    // Taxation Details
    gstNumber: String,
    aadharNumber: String,
    panNumber: String,
    iecNumber: String,
    tanNumber: String,
    vatNumber: String,

    // Additional Details
    companyLogo: String, // Store URL or file path
    companyPhotos: [String], // Array of image URLs
    companyVideo: String, // Video URL
    companyDescription: String,

    // Business Preferences
    businessType: {
        type: [String], // 👈 Make sure this is an array of strings
        default: [],
      },
    workingDays: { type: [String] }, // Example: ["Monday", "Tuesday"]
    workingTime: {
        from: String, // Example: "09:00 AM"
        to: String, // Example: "06:00 PM"
    },
    preferredBusinessStates: [String],
    preferredBusinessCities: [String],
    nonBusinessCities: [String], // Cities to exclude
});

export default mongoose.models.BusinessProfile || mongoose.model("BusinessProfile", businessProfileSchema);
