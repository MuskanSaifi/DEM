// api/buyer/verifyotp
import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import { generateToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { mobileNumber, otp } = body;

    if (!mobileNumber || !otp) {
      return new Response(JSON.stringify({ error: "Mobile number and OTP required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buyer = await Buyer.findOne({
      mobileNumber,
      otp,
      otpExpires: { $gt: new Date() },
    });

    if (!buyer) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = generateToken(buyer);

    return new Response(JSON.stringify({ message: "OTP verified successfully", token, buyer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
