import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesEmployee",
      required: true,
    },
    agentName: { type: String, default: "" },
    clientName: { type: String, default: "Client" },
    clientMobile: { type: String, default: "" },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesLead",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
    roomId: { type: String, required: true, unique: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    monitoredBy: [
      {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesAdmin" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    callingMode: {
      type: String,
      enum: ["twilio", "mic-only", "webrtc"],
      default: "twilio",
    },
    twilioClientCallSid: { type: String, default: null },
    twilioClientStatus: { type: String, default: null },
  },
  { timestamps: true }
);

callSessionSchema.index({ status: 1, startedAt: -1 });
callSessionSchema.index({ agentId: 1, status: 1 });

if (mongoose.models.CallSession) delete mongoose.models.CallSession;
export default mongoose.model("CallSession", callSessionSchema);
