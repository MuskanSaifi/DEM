import mongoose from "mongoose";

const BuyerSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  mobileNumber: { type: String, required: true, unique: true },
  countryCode: {
    value: String,
    label: String,
    name: String
  },
   termsAccepted: { type: Boolean, default: false },
  productname: String,
  inquiredProducts: [String],
  quantity: Number,
  unit: String,
  orderValue: Number,
  currency: String,
  buyer: String,
  otp: Number,
  otpExpires: Date,
  remark: { type: String, default: "" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

const Buyer = mongoose.models.Buyer || mongoose.model("Buyer", BuyerSchema);
export default Buyer;
