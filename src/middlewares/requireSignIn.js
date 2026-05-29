import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";

export async function requireSignIn(req) {
  try {
    // Correctly get the header using the lowercase name for consistency
    const authorizationHeader = req.headers.get("authorization");
    if (!authorizationHeader) return null;

    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader;

    if (!token) return null;

    // Use try-catch to handle JWT verification errors
    const decoded = jwt.verify(token, getJwtSecret());
    return { id: decoded.id, email: decoded.email };
  } catch (error) {
    console.error("Authentication Error:", error);
    return null;
  }
}