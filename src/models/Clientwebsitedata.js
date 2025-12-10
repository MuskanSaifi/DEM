// models/Clientwebsitedata
import mongoose from 'mongoose';

const clientWebsiteDataSchema = new mongoose.Schema(
  {
    websitename: String,
    name: String,
    number: String,
    companyName: String,
    email: String,
    address: String,
    requirement: String,
  },
  {
    timestamps: true, // <-- this works when model + collection correct
  }
);

export default mongoose.models.ClientWebsiteData ||
  mongoose.model("ClientWebsiteData", clientWebsiteDataSchema);
