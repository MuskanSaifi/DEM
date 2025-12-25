import Buyer from "@/models/Buyer";
import connectdb from "@/lib/dbConnect";
import { generateToken } from "@/lib/jwt"; // ✅ Reuse same JWT utility

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

    // ✅ Combine country code + mobile number (e.g., +91 + 9876543210)
    const fullMobile = `${countryCode}${mobileNumber}`;
    const formattedMobile = fullMobile.startsWith("+")
      ? fullMobile.slice(1)
      : fullMobile;

    const testNumber = "+919643685727";
    const testOtp = "12345";

    // ========== OTP Send ==========
    if (!otp) {
     // ✅ For test number, skip sending
  if (fullMobile === testNumber) {
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
  const otpExpires = new Date(Date.now() + 5 * 60000);

  buyer.otp = generatedOtp;
  buyer.otpExpires = otpExpires;
  await buyer.save();
  
      // ✅ Send OTP via 2Factor API
      try {
        const apiKey = "afd6c091-063e-11f0-8b17-0200cd936042";
        const otpTemplateName = "OTPtemplate";

        const response = await fetch(
          `https://2factor.in/API/V1/${apiKey}/SMS/${formattedMobile}/${generatedOtp}/${otpTemplateName}`,
          { method: "GET" }
        );
        const result = await response.json();

        if (response.ok && result.Status === "Success") {
          return new Response(JSON.stringify({ message: "OTP sent successfully", mobileNumber: fullMobile }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } else {
          console.error("2Factor Error:", result);
          return new Response(JSON.stringify({ error: "Failed to send OTP" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (apiError) {
        console.error("2Factor API Error:", apiError);
        return new Response(JSON.stringify({ error: "OTP sending failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // ========== OTP Verify ==========
    else {
      if (fullMobile === testNumber && otp === testOtp) {
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
    }
  } catch (error) {
    console.error("Buyer Login API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
