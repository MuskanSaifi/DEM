import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import PendingBuyerOtp from "@/models/PendingBuyerOtp";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getOtpExpireMinutes } from "@/lib/env";
import { isBuyerNameTakenToday, SAME_NAME_TODAY_MESSAGE } from "@/lib/buyerDailyNameLimit";
import { assertValidBuyerEmail } from "@/lib/buyerSpamGuard";

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

    const emailCheck = assertValidBuyerEmail(email);
    if (!emailCheck.ok) {
      return new Response(JSON.stringify({ error: emailCheck.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedMobile = `${countryCode}${mobileNumber}`;

    const existingBuyer = await Buyer.findOne({ mobileNumber: formattedMobile });
    if (existingBuyer) {
      return new Response(
        JSON.stringify({ error: "This number already exists. Please login." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (await isBuyerNameTakenToday(fullname)) {
      return new Response(JSON.stringify({ error: SAME_NAME_TODAY_MESSAGE }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60 * 1000);

    // Do NOT create Buyer until OTP is verified — store pending only
    await PendingBuyerOtp.findOneAndUpdate(
      { mobileNumber: formattedMobile },
      {
        fullname,
        email: email || "",
        mobileNumber: formattedMobile,
        countryCode,
        productname: productname || "",
        otp,
        otpExpires,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const sent = await send2FactorOtp(formattedMobile, otp);
    if (!sent.ok) {
      await PendingBuyerOtp.deleteOne({ mobileNumber: formattedMobile });
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
