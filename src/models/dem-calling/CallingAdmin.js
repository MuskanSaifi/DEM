import mongoose from "mongoose";

const callingAdminSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.CallingAdmin) delete mongoose.models.CallingAdmin;
export default mongoose.model("CallingAdmin", callingAdminSchema);
