const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountType: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    confirmAccountNumber: { 
        type: String, 
        validate: { 
            validator: function(value) {
                return value === this.accountNumber;
            },
            message: "Account numbers do not match!"
        }
    },
    ifscCode: { 
        type: String, 
        match: /^[A-Z]{4}0[A-Z0-9]{6}$/, 
        set: v => v.toUpperCase() // Convert IFSC to uppercase before saving
    },
    mobileLinked: { 
        type: String, 
        match: /^[6-9]\d{9}$/, 
        set: v => v.replace(/^\+91/, "") // Remove +91 before saving
    }
}, { timestamps: true });

export default mongoose.models.BankDetails || mongoose.model("BankDetails", bankDetailsSchema);
