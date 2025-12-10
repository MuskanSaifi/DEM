import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import BankDetails from "@/models/BankDetails"; // ✅ Import BankDetails model
import BusinessProfile from "@/models/BusinessProfile";

export async function GET(req, context) {
  await connectdb();

  try {
    const { slug } = await context.params;

    // Find user and populate products
    const user = await User.findOne({ userProfileSlug: slug }).populate("products");

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), {
        status: 404,
      });
    }


    // ✅ Fetch business profile using user._id
    const businessProfile = await BusinessProfile.findOne({ userId: user._id });


    return new Response(JSON.stringify({
      success: true,
      user,
      businessProfile,  // ✅ Include business profile

    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
    });
  }
}
