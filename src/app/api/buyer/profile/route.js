import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

// Helper: upload image to Cloudinary
const uploadBuyerImage = async (image) => {
  if (!image || typeof image !== "string" || !image.startsWith("data:image")) {
    return { url: image, public_id: null };
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: "buyer",
    resource_type: "image",
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  });
  return { url: result.secure_url, public_id: result.public_id };
};

// PATCH → Update Buyer Profile
export async function PATCH(req) {
  try {
    await connectdb();
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader)
      return new Response(JSON.stringify({ success: false, message: "No token provided" }), { status: 401 });

    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    const existingBuyer = await Buyer.findById(decoded.id);
    if (!existingBuyer)
      return new Response(JSON.stringify({ success: false, message: "Buyer not found" }), { status: 404 });

    delete body.buyerProfileSlug;

    // Handle image upload
    if (body.image && body.image.startsWith("data:image")) {
      if (existingBuyer.imagePublicId) {
        await cloudinary.uploader.destroy(existingBuyer.imagePublicId);
      }
      const uploaded = await uploadBuyerImage(body.image);
      body.image = uploaded.url;
      body.imagePublicId = uploaded.public_id;
    } else {
      body.image = existingBuyer.image;
      body.imagePublicId = existingBuyer.imagePublicId;
    }

    if (body.fullname && (body.fullname !== existingBuyer.fullname || !existingBuyer.buyerProfileSlug)) {
      const slugified = slugify(body.fullname, { lower: true, strict: true });
      const suffix = existingBuyer._id.toString().slice(-6);
      body.buyerProfileSlug = `${slugified}-${suffix}`;
    }

    const updatedBuyer = await Buyer.findByIdAndUpdate(decoded.id, body, {
      new: true,
      runValidators: true,
    });

    return new Response(JSON.stringify({ success: true, buyer: updatedBuyer }), { status: 200 });
  } catch (error) {
    console.error("❌ Buyer update error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error updating buyer profile", error: error.message }),
      { status: 500 }
    );
  }
}

// GET → Fetch Buyer Profile
export async function GET(req) {
  try {
    await connectdb();

    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader)
      return new Response(JSON.stringify({ success: false, message: "No token provided" }), { status: 401 });

    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const buyer = await Buyer.findById(
      decoded.id,
      "buyerProfileSlug fullname email mobileNumber companyName designation image isVerified productname quantity unit currency"
    );

    if (!buyer)
      return new Response(JSON.stringify({ success: false, message: "Buyer not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, buyer }), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching buyer profile:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching buyer", error: error.message }),
      { status: 500 }
    );
  }
}
