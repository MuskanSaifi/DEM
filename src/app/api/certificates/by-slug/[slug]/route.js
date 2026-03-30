import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import Certificate from "@/models/Certificate";

export async function GET(_req, { params }) {
  await connectdb();
  try {
    const { slug } = await params;
    const user = await User.findOne({ userProfileSlug: slug }, { _id: 1 }).lean();
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cert = await Certificate.findOne({ userId: user._id, status: "active" })
      .select("companyName certificateNumber issuedAt validUntil status")
      .lean();

    if (!cert) {
      return new Response(JSON.stringify({ success: true, certified: false, certificate: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, certified: true, certificate: cert }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Public certificate lookup error:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

