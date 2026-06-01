import connectdb from "@/lib/dbConnect";
import Certificate from "@/models/Certificate";
import User from "@/models/User";
import { send2FactorGrcOtp, maskMobileNumber } from "@/lib/twoFactor";
import { getOtpExpireMinutes } from "@/lib/env";
import { normalizeIndianMobile } from "@/lib/phone";

function normalizeCertNo(value) {
  return (value || "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

async function resolveVerifyMobile(cert) {
  const stored = normalizeIndianMobile(cert.verifyMobileNumber || "");
  if (stored) return stored;

  if (cert.userId) {
    const user = await User.findById(cert.userId).select("mobileNumber").lean();
    return normalizeIndianMobile(user?.mobileNumber || "");
  }

  return "";
}

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const certNo = normalizeCertNo(body.certificateNumber || body.certNo);

    if (!certNo) {
      return Response.json(
        { success: false, message: "Certificate number is required" },
        { status: 400 }
      );
    }

    const cert = await Certificate.findOne({ certificateNumber: certNo });
    if (!cert) {
      return Response.json(
        { success: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

    const mobile = await resolveVerifyMobile(cert);
    if (!mobile) {
      return Response.json(
        {
          success: false,
          message:
            "No mobile number linked to this certificate. Please contact Dial Export Mart support.",
        },
        { status: 400 }
      );
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60 * 1000);

    cert.verifyOtp = otp;
    cert.verifyOtpExpires = otpExpires;
    await cert.save();

    const sent = await send2FactorGrcOtp(mobile, otp);
    if (!sent.ok) {
      cert.verifyOtp = null;
      cert.verifyOtpExpires = null;
      await cert.save();
      return Response.json(
        {
          success: false,
          message: sent.error || "Failed to send OTP. Please try again.",
        },
        { status: sent.notOnSmsRoute ? 503 : 500 }
      );
    }

    return Response.json({
      success: true,
      message: "OTP sent via SMS to your registered mobile",
      maskedMobile: maskMobileNumber(mobile),
      expiresInMinutes: getOtpExpireMinutes(),
      deliveryChannel: "sms",
    });
  } catch (error) {
    console.error("Certificate send-otp error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
