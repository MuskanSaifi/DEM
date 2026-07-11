import mongoose from "mongoose";

const callingAgentSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobile: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CallingAdmin",
      required: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.CallingAgent) delete mongoose.models.CallingAgent;
export default mongoose.model("CallingAgent", callingAgentSchema);
