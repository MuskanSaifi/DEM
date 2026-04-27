import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import { verifyToken } from "@/lib/auth";
import Admin from "@/models/Admin";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Certificate from "@/models/Certificate";

function getAdminIdFromCookie(req) {
  const token = req.cookies.get("adminToken")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.id || null;
}

function makeCertificateNumber() {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `GRC${Date.now().toString().slice(-8)}${rand}`;
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
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim();

    const query = {};
    if (status) query.status = status;

    if (q) {
      // search by companyName / certificateNumber / user slug
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const users = await User.find({ userProfileSlug: regex }, { _id: 1 }).lean();
      const userIds = users.map((u) => u._id);
      query.$or = [
        { companyName: regex },
        { certificateNumber: regex },
        ...(userIds.length ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const certs = await Certificate.find(query)
      .populate("userId", "fullname email mobileNumber userProfileSlug companyName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, certificates: certs }, { status: 200 });
  } catch (error) {
    console.error("Admin certificates GET error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
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

    const body = await req.json();
    const userSlug = (body.userSlug || "").trim();
    const issuedAtRaw = body.issuedAt;
    const validUntilRaw = body.validUntil;
    const certificateNumberIn = (body.certificateNumber || "").trim();
    const companyNameIn = (body.companyName || "").trim();

    if (!issuedAtRaw || !validUntilRaw) {
      return NextResponse.json(
        { success: false, message: "issuedAt and validUntil are required" },
        { status: 400 }
      );
    }

    const issuedAt = new Date(issuedAtRaw);
    const validUntil = new Date(validUntilRaw);
    if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(validUntil.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid dates" }, { status: 400 });
    }

    let user = null;
    let businessProfile = null;
    if (userSlug) {
      user = await User.findOne({ userProfileSlug: userSlug }).lean();
      if (!user) {
        if (!companyNameIn) {
          return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        user = null;
      }
      if (user) {
        businessProfile = await BusinessProfile.findOne({ userId: user._id }).lean();

        const existingActive = await Certificate.findOne({ userId: user._id, status: "active" }).lean();
        if (existingActive) {
          return NextResponse.json(
            { success: false, message: "Active certificate already exists for this user" },
            { status: 409 }
          );
        }
      }
    } else {
      if (!companyNameIn) {
        return NextResponse.json(
          { success: false, message: "companyName is required when userSlug is not provided" },
          { status: 400 }
        );
      }
    }

    const cert = await Certificate.create({
      userId: user?._id || null,
      businessProfileId: businessProfile?._id || null,
      companyName: user
        ? companyNameIn || businessProfile?.companyName || user.companyName || user.fullname || "—"
        : companyNameIn,
      certificateNumber: certificateNumberIn || makeCertificateNumber(),
      issuedAt,
      validUntil,
      status: "active",
      issuedByAdminId: adminId,
    });

    return NextResponse.json({ success: true, certificate: cert }, { status: 201 });
  } catch (error) {
    console.error("Admin certificates POST error:", error);
    const msg =
      error?.code === 11000
        ? "Duplicate certificateNumber. Try again."
        : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

