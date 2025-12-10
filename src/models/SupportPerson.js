import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const supportPersonSchema = new mongoose.Schema(
  {
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    name: { type: String },
    number: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    allSellerAccess: { type: Boolean, default: false },
    allBuyerAccess: { type: Boolean, default: false },
    allContactAccess: { type: Boolean, default: false }, 
    allSubscribersAccess: { type: Boolean, default: false }, 
    allPaymentsAccess: { type: Boolean, default: false }, 


    recordingurl: [
      {
        url: { type: String, unique: true },
        uploadTime: { type: Date, default: Date.now },
        tag: {
          type: String,
          enum: ["genuine", "fake", "other"],
          default: "other",
        },
        messages: [
          {
            text: { type: String },
            sentAt: { type: Date, default: Date.now },
          },
        ],
        adminmessages: [
          {
            text: { type: String },
            sentAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
supportPersonSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// For login comparison
supportPersonSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.SupportPerson || mongoose.model("SupportPerson", supportPersonSchema);
