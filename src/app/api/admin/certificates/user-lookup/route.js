import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { verifyToken } from "@/lib/auth";
import Admin from "@/models/Admin";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import { normalizeIndianMobile, isValidIndianMobile } from "@/lib/phone";

function getAdminIdFromCookie(req) {
  const token = req.cookies.get("adminToken")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.id || null;
}

export async function GET(req) {
  try {
    await connectdb();
    const adminId = getAdminIdFromCookie(req);
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const admin = await Admin.findById(adminId).lean();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phoneInput = searchParams.get("phone") || "";
    const normalizedDigits = (phoneInput || "").toString().replace(/[^\d]/g, "");

    if (!normalizedDigits) {
      return NextResponse.json({
        success: true,
        registered: false,
        message: "Enter phone number to search",
        suggestions: [],
        verifyMobile: "",
      });
    }

    const regex = new RegExp(
      normalizedDigits.slice(-10).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    const users = await User.find({
      $or: [{ mobileNumber: regex }, { alternateMobileNumber: regex }, { whatsappNumber: regex }],
    })
      .select("fullname companyName mobileNumber alternateMobileNumber whatsappNumber userProfileSlug")
      .limit(10)
      .lean();

    const verifyMobile = normalizeIndianMobile(phoneInput);

    if (!users.length) {
      const validPhone = isValidIndianMobile(verifyMobile);
      return NextResponse.json({
        success: true,
        registered: false,
        canIssueWithoutAccount: validPhone,
        verifyMobile: validPhone ? verifyMobile : "",
        message: validPhone
          ? "No account on this number. You can still issue a certificate — OTP will be sent to this mobile."
          : "Enter a valid 10-digit mobile number.",
        suggestions: [],
      });
    }

    const userIds = users.map((u) => u._id);
    const profiles = await BusinessProfile.find({ userId: { $in: userIds } })
      .select("userId companyName")
      .lean();
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const suggestions = users.map((u) => {
      const hasSlug = !!(u.userProfileSlug || "").trim();
      const profile = profileMap.get(String(u._id));
      const hasCompany = !!(
        (profile?.companyName || "").trim() ||
        (u.companyName || "").trim()
      );
      const profileComplete = hasSlug && hasCompany;

      return {
        userId: String(u._id),
        fullname: u.fullname || "",
        companyName: profile?.companyName || u.companyName || "",
        mobileNumber: u.mobileNumber || "",
        alternateMobileNumber: u.alternateMobileNumber || "",
        whatsappNumber: u.whatsappNumber || "",
        userProfileSlug: u.userProfileSlug || "",
        profileComplete,
        note: profileComplete ? "" : "This customer profile is incomplete.",
      };
    });

    return NextResponse.json({
      success: true,
      registered: true,
      canIssueWithoutAccount: false,
      verifyMobile: verifyMobile || normalizeIndianMobile(users[0]?.mobileNumber || ""),
      message: "",
      suggestions,
    });
  } catch (error) {
    console.error("Admin certificate user-lookup error:", error);
    return NextResponse.json(
      { success: false, message: "Lookup failed", suggestions: [] },
      { status: 500 }
    );
  }
}
