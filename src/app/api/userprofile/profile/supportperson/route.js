import connectdb from "@/lib/dbConnect";
import SupportPerson from "@/models/SupportPerson";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectdb();

    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token format" }),
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token" }),
        { status: 401 }
      );
    }

    // ✅ Get user with supportPerson field
    const user = await User.findById(decoded.id).select("supportPerson");

    if (!user || !user.supportPerson) {
      return new Response(
        JSON.stringify({ success: true, supportperson: null }),
        { status: 200 }
      );
    }

    const supportperson = await SupportPerson.findById(user.supportPerson)
      .select("-password -clients -_id");
    return new Response(
      JSON.stringify({ success: true, supportperson }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching user", error: error.message }),
      { status: 500 }
    );
  }
}
