import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import Certificate from "@/models/Certificate";

export async function POST(req) {
  await connectdb();
  try {
    const body = await req.json();
    const slugsIn = Array.isArray(body?.slugs) ? body.slugs : [];
    const slugs = slugsIn
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean)
      .slice(0, 200);

    if (slugs.length === 0) {
      return new Response(JSON.stringify({ success: true, certifiedBySlug: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const users = await User.find({ userProfileSlug: { $in: slugs } }, { _id: 1, userProfileSlug: 1 }).lean();
    const userIdBySlug = new Map(users.map((u) => [u.userProfileSlug, u._id]));

    const userIds = users.map((u) => u._id);
    const certs = await Certificate.find({ userId: { $in: userIds }, status: "active" })
      .select("userId")
      .lean();
    const activeUserIds = new Set(certs.map((c) => String(c.userId)));

    const certifiedBySlug = {};
    for (const slug of slugs) {
      const uid = userIdBySlug.get(slug);
      certifiedBySlug[slug] = uid ? activeUserIds.has(String(uid)) : false;
    }

    return new Response(JSON.stringify({ success: true, certifiedBySlug }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Batch certificate lookup error:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

