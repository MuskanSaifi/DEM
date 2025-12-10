import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product"; // This import seems unused in the provided snippet but keeping it
import User from "@/models/User";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import cloudinary from "@/lib/cloudinary"; // This correctly imports the v2 object aliased as cloudinary

// Set the body parser size limit for this API route to handle larger image payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Configured to accept request bodies up to 4MB
    },
  },
};

const uploadUserImage = async (image) => {
  // Added a check for empty image string or non-base64, which was missing in the previous context
  // If the image isn't a base64 string, assume it's an existing URL (or empty) and return it.
  // This prevents re-uploading an already uploaded image or trying to upload non-image data.
  if (!image || typeof image !== "string" || !image.startsWith("data:image")) {
    console.log("No new base64 image provided, or image is already a URL/invalid format. Skipping upload.");
    return { url: image, public_id: null }; // Return original image value or null
  }

  try {
    // Correctly using cloudinary.uploader.upload
    const result = await cloudinary.uploader.upload(image, {
      folder: "user", // Folder in your Cloudinary account
      resource_type: "image", // Ensure it's treated as an image
      transformation: [{ width: 300, height: 300, crop: "limit" }], // Resize/crop settings
    });

    console.log("Cloudinary upload successful:", result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    // Log detailed Cloudinary error for debugging
    console.error("❌ Cloudinary upload failed:", {
      message: err.message,
      name: err.name,
      http_code: err.http_code, // Cloudinary API errors often have an http_code
      error: err.error, // Cloudinary API errors often have an error object
    });
    // Throw a more specific error message back to the caller
    throw new Error(`User image upload failed: ${err.message || 'Unknown Cloudinary error'}`);
  }
};

export async function PATCH(req) {
  try {
    await connectdb();

    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ success: false, message: "No token provided" }), { status: 401 });
    }

    const token = authorizationHeader.split(" ")[1];
    // Verify JWT token with the secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    const existingUser = await User.findById(decoded.id);
    if (!existingUser) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    // Prevent direct update of userProfileSlug from client
    delete body.userProfileSlug;

    // Handle image upload or removal
    if (body.icon && typeof body.icon === "string" && body.icon.startsWith("data:image")) {
      // If a new base64 image is provided for upload
      // If there's an old image, delete it from Cloudinary first
      if (existingUser.iconPublicId) {
        try {
          console.log("Attempting to delete old image:", existingUser.iconPublicId);
          // Changed cloudinary.v2.uploader.destroy to cloudinary.uploader.destroy
          await cloudinary.uploader.destroy(existingUser.iconPublicId);
          console.log("Old image deleted successfully.");
        } catch (deleteError) {
          // Log deletion error but continue with upload to allow profile update
          console.error("❌ Failed to delete old image from Cloudinary during update:", deleteError);
        }
      }

      // Upload the new image
      const uploaded = await uploadUserImage(body.icon);
      body.icon = uploaded.url; // Store the secure URL
      body.iconPublicId = uploaded.public_id; // Store the public ID for future deletion
    } else if (body.icon === null || body.icon === '') {
      // Case where user explicitly clears/removes the image
      if (existingUser.iconPublicId) {
        try {
          console.log("Attempting to delete user-removed image:", existingUser.iconPublicId);
          // Changed cloudinary.v2.uploader.destroy to cloudinary.uploader.destroy
          await cloudinary.uploader.destroy(existingUser.iconPublicId);
          console.log("User-removed image deleted successfully.");
        } catch (deleteError) {
          console.error("❌ Failed to delete image on user removal from Cloudinary:", deleteError);
        }
      }
      body.icon = null; // Clear the icon URL in the database
      body.iconPublicId = null; // Clear public ID in the database
    } else {
      // If body.icon is not a new base64 image and not null/empty, it means
      // the existing image URL is being sent back, so no change needed.
      // We should keep the existing iconPublicId if the URL is unchanged.
      // This path handles cases where the user saves other profile details
      // without changing the image.
      body.icon = existingUser.icon;
      body.iconPublicId = existingUser.iconPublicId;
    }


    // Update profile slug if companyName is updated or if it's a new profile
    if (body.companyName && (body.companyName !== existingUser.companyName || !existingUser.userProfileSlug)) {
      const slugified = slugify(body.companyName, { lower: true, strict: true });
      // Use the last 6 characters of the user ID for a unique suffix to ensure uniqueness
      const suffix = existingUser._id.toString().slice(-6);
      body.userProfileSlug = `${slugified}-${suffix}`;
      console.log("Generated new userProfileSlug:", body.userProfileSlug);
    }

    // Find and update the user document in the database
    const updatedUser = await User.findByIdAndUpdate(decoded.id, body, {
      new: true, // Return the updated document after the operation
      runValidators: true, // Run Mongoose schema validators on the update operation
    });

    if (!updatedUser) {
      return new Response(JSON.stringify({ success: false, message: "User not found after update attempt." }), { status: 404 });
    }

    console.log("User profile updated successfully.");
    return new Response(JSON.stringify({ success: true, user: updatedUser }), { status: 200 });

  } catch (error) {
    console.error("❌ User update error in PATCH handler:", error);
    // Return a generic error message to the client, but log the specific error on the server
    return new Response(JSON.stringify({ success: false, message: "Error updating user profile", error: error.message }), { status: 500 });
  }
};

export async function GET(req) {
  try {
    await connectdb();
    // Extract Authorization header
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 401 }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token format" }),
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token" }),
        { status: 401 }
      );
    }

// Fetch user details from database (FIX: Use decoded.id instead of decoded.userId)
    const user = await User.findById(decoded.id, "userProfileSlug icon fullname email mobileNumber alternateMobileNumber alternateEmail whatsappNumber designation  companyName  userPackage userPackageHistory isVerified supportPerson");
// Count products created by the user
const productsLength = await Product.countDocuments({ userId: decoded.id });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }
    return new Response(
      JSON.stringify({ success: true, user, productsLength }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching user", error: error.message }),
      { status: 500 }
    );
  }
}
