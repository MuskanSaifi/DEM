import Buyer from "@/models/Buyer";
import connectdb from "@/lib/dbConnect";
import { generateToken } from "@/lib/jwt";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getTestOtpPhone, getTestOtpCode, getOtpExpireMinutes } from "@/lib/env";

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { mobileNumber, countryCode, otp } = body;

    if (!mobileNumber || !countryCode) {
      return new Response(JSON.stringify({ error: "Mobile number and country code required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fullMobile = `${countryCode}${mobileNumber}`;
    const testNumber = getTestOtpPhone();
    const testOtp = getTestOtpCode();

    if (!otp) {
      if (testNumber && fullMobile === testNumber) {
        return new Response(JSON.stringify({ message: "Static OTP enabled for test buyer", mobileNumber: fullMobile }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      let buyer = await Buyer.findOne({ mobileNumber: fullMobile });
      if (!buyer) {
        return new Response(
          JSON.stringify({ error: "Mobile number not found, please register first" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const generatedOtp = Math.floor(1000 + Math.random() * 9000);
      const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60000);

      buyer.otp = generatedOtp;
      buyer.otpExpires = otpExpires;
      await buyer.save();

      const sent = await send2FactorOtp(fullMobile, generatedOtp);
      if (!sent.ok) {
        return new Response(JSON.stringify({ error: sent.error || "Failed to send OTP" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ message: "OTP sent successfully", mobileNumber: fullMobile }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (testNumber && testOtp && fullMobile === testNumber && otp === testOtp) {
      let buyer = await Buyer.findOne({ mobileNumber: fullMobile });
      if (!buyer) {
        buyer = new Buyer({ mobileNumber: fullMobile, countryCode, otp: null });
        await buyer.save();
      }

      const token = generateToken(buyer);
      return new Response(
        JSON.stringify({ message: "Login successful (Test Buyer)", token, buyer }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const buyer = await Buyer.findOne({
      mobileNumber: fullMobile,
      otp,
      otpExpires: { $gt: new Date() },
    });

    if (!buyer) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    buyer.otp = null;
    buyer.otpExpires = null;
    await buyer.save();

    const token = generateToken(buyer);
    return new Response(
      JSON.stringify({ message: "Login successful", token, buyer }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Buyer Login API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
