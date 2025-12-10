import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^\+?[1-9]\d{1,14}$/,
        "Please provide a valid phone number with country code",
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
    },
  },
  {
    timestamps: true, // Automatically includes createdAt and updatedAt
  }
);

const Contact = mongoose.models.Contact || mongoose.model("Contact", ContactSchema);

export default Contact;
