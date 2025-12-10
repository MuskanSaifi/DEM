  // import cloudinary from "cloudinary";
  import { v2 as cloudinary } from "cloudinary";

  // cloudinary.v2.config({
    cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  export default cloudinary;