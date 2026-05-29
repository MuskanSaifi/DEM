import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getOtpExpireMinutes } from "@/lib/env";

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { fullname, email, mobileNumber, countryCode, productname } = body;

    if (!fullname || !mobileNumber || !countryCode) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedMobile = `${countryCode}${mobileNumber}`;

    let existingBuyer = await Buyer.findOne({ mobileNumber: formattedMobile });

    if (existingBuyer) {
      return new Response(
        JSON.stringify({ error: "This number already exists. Please login." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60 * 1000);

    const newBuyer = new Buyer({
      fullname,
      email,
      mobileNumber: formattedMobile,
      countryCode,
      productname,
      otp,
      otpExpires,
    });

    await newBuyer.save();

    const sent = await send2FactorOtp(formattedMobile, otp);
    if (!sent.ok) {
      return new Response(
        JSON.stringify({ error: sent.error || "Failed to send OTP. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "OTP sent successfully",
        mobileNumber: formattedMobile,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send OTP Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
