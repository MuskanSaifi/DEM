import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";

import { getJwtSecret } from "@/lib/env";

export async function requireSignIn(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret());
    const admin = await Admin.findById(decoded.id).select("-password");
    return admin || null;
  } catch (err) {
    console.error("Auth Error:", err);
    return null;
  }
}
