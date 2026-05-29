import connectdb from "@/lib/dbConnect";
import Certificate from "@/models/Certificate";
import User from "@/models/User";

function normalizeCertNo(value) {
  return (value || "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const certNo = normalizeCertNo(body.certificateNumber || body.certNo);
    const otp = (body.otp || "").toString().trim();

    if (!certNo || !otp) {
      return Response.json(
        { success: false, message: "Certificate number and OTP are required" },
        { status: 400 }
      );
    }

    const cert = await Certificate.findOne({
      certificateNumber: certNo,
      verifyOtp: otp,
      verifyOtpExpires: { $gt: new Date() },
    });

    if (!cert) {
      return Response.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    cert.verifyOtp = null;
    cert.verifyOtpExpires = null;
    await cert.save();

    let userProfileSlug = "";
    if (cert.userId) {
      const user = await User.findById(cert.userId)
        .select("userProfileSlug")
        .lean();
      userProfileSlug = user?.userProfileSlug || "";
    }

    return Response.json({
      success: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        companyName: cert.companyName,
        issuedAt: cert.issuedAt,
        validUntil: cert.validUntil,
        status: cert.status,
        userProfileSlug,
      },
    });
  } catch (error) {
    console.error("Certificate confirm-otp error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
