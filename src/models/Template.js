import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
      unique: true, // e.g. D0005
    },

    title: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
    },

    style: {
      type: String,
    },

    type: {
      type: String,
      enum: ["web", "mobile"],
      default: "web",
    },

    thumbnail: {
      url: String,
      publicId: String, // cloudinary public_id
    },

    previewImages: [
      {
        url: String,
        publicId: String,
      },
    ],

    colors: [
      {
        name: String, // Red, Blue
        hex: String,  // #ff0000
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Template ||
  mongoose.model("Template", TemplateSchema);
