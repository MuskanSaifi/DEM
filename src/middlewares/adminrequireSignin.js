import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function requireSignIn(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    return admin || null;
  } catch (err) {
    console.error("Auth Error:", err);
    return null;
  }
}
