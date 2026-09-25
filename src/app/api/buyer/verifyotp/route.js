import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import PendingBuyerOtp from "@/models/PendingBuyerOtp";
import { generateToken } from "@/lib/jwt";
import { isBuyerNameTakenToday, SAME_NAME_TODAY_MESSAGE } from "@/lib/buyerDailyNameLimit";
import { assertValidBuyerEmail } from "@/lib/buyerSpamGuard";

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

    const pending = await PendingBuyerOtp.findOne({
      mobileNumber,
      otp: Number(otp),
      otpExpires: { $gt: new Date() },
    });

    if (!pending) {
      // Legacy: buyer created before pending-OTP flow
      const legacyBuyer = await Buyer.findOne({
        mobileNumber,
        otp: Number(otp),
        otpExpires: { $gt: new Date() },
      });

      if (!legacyBuyer) {
        return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      legacyBuyer.otp = null;
      legacyBuyer.otpExpires = null;
      await legacyBuyer.save();

      const token = generateToken(legacyBuyer);
      return new Response(
        JSON.stringify({ message: "OTP verified successfully", token, buyer: legacyBuyer }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailCheck = assertValidBuyerEmail(pending.email);
    if (!emailCheck.ok) {
      await PendingBuyerOtp.deleteOne({ _id: pending._id });
      return new Response(JSON.stringify({ error: emailCheck.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let buyer = await Buyer.findOne({ mobileNumber: pending.mobileNumber });
    if (!buyer) {
      if (await isBuyerNameTakenToday(pending.fullname)) {
        await PendingBuyerOtp.deleteOne({ _id: pending._id });
        return new Response(JSON.stringify({ error: SAME_NAME_TODAY_MESSAGE }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      buyer = new Buyer({
        fullname: pending.fullname,
        email: pending.email,
        mobileNumber: pending.mobileNumber,
        countryCode: pending.countryCode,
        productname: pending.productname || undefined,
        companyName: pending.companyName || "",
        inquiredProducts: pending.productname ? [pending.productname] : [],
      });
      await buyer.save();
    }

    await PendingBuyerOtp.deleteOne({ _id: pending._id });

    const token = generateToken(buyer);
    return new Response(
      JSON.stringify({ message: "OTP verified successfully", token, buyer }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
