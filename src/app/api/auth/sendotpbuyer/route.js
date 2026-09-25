import Buyer from "@/models/Buyer";
import PendingBuyerOtp from "@/models/PendingBuyerOtp";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getOtpExpireMinutes } from "@/lib/env";
import { isBuyerNameTakenToday, SAME_NAME_TODAY_MESSAGE } from "@/lib/buyerDailyNameLimit";
import { assertValidBuyerEmail } from "@/lib/buyerSpamGuard";

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { fullname, email, mobileNumber, countryCode, companyName, productname, otp } = body;

    if (!mobileNumber || !productname || !countryCode) {
      return new Response(
        JSON.stringify({ error: "All fields (including country code) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailCheck = assertValidBuyerEmail(email);
    if (!emailCheck.ok) {
      return new Response(JSON.stringify({ error: emailCheck.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedMobile = mobileNumber.startsWith("+")
      ? mobileNumber
      : `${countryCode}${mobileNumber}`;

    let existingBuyer = await Buyer.findOne({
      $or: [{ mobileNumber: formattedMobile }, { mobileNumber }],
    });

    // Step 1: Send OTP
    if (!otp) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000);
      const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60000);

      if (existingBuyer) {
        existingBuyer.otp = generatedOtp;
        existingBuyer.otpExpires = otpExpires;
        if (productname) existingBuyer.productname = productname;
        await existingBuyer.save();
      } else {
        if (await isBuyerNameTakenToday(fullname)) {
          return new Response(JSON.stringify({ error: SAME_NAME_TODAY_MESSAGE }), {
            status: 409,
            headers: { "Content-Type": "application/json" },
          });
        }

        await PendingBuyerOtp.findOneAndUpdate(
          { mobileNumber: formattedMobile },
          {
            fullname,
            email: email || "",
            mobileNumber: formattedMobile,
            countryCode,
            companyName: companyName || "",
            productname,
            otp: generatedOtp,
            otpExpires,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      const sent = await send2FactorOtp(formattedMobile, generatedOtp);
      if (!sent.ok) {
        if (!existingBuyer) {
          await PendingBuyerOtp.deleteOne({ mobileNumber: formattedMobile });
        }
        return new Response(
          JSON.stringify({ error: sent.error || "Failed to send OTP. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "OTP sent successfully", mobileNumber: formattedMobile }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Verify OTP
    const otpNum = Number(otp);
    let buyer = existingBuyer;

    if (buyer) {
      if (buyer.otp !== otpNum || !buyer.otpExpires || new Date() > buyer.otpExpires) {
        return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      buyer.otp = null;
      buyer.otpExpires = null;
      await buyer.save();
    } else {
      const pending = await PendingBuyerOtp.findOne({
        mobileNumber: formattedMobile,
        otp: otpNum,
        otpExpires: { $gt: new Date() },
      });

      if (!pending) {
        return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

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
        companyName: pending.companyName || "",
        productname: pending.productname,
        inquiredProducts: pending.productname ? [pending.productname] : [],
      });
      await buyer.save();
      await PendingBuyerOtp.deleteOne({ _id: pending._id });
    }

    const matchingProducts = await Product.find({ name: productname }).populate(
      "userId",
      "fullname"
    );

    if (!matchingProducts.length) {
      return new Response(JSON.stringify({ message: "No matching products found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const productDetails = matchingProducts.map((p) => ({
      name: p.name,
      price: p.price,
      seller: p.userId ? p.userId.fullname : "Unknown",
      url: p.url || "No Link",
    }));

    return new Response(JSON.stringify({ message: "OTP verified", productDetails, buyer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
