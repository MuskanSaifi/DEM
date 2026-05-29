import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";

export function getUserFromRequest(req) {
  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader) return null;
  const token = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.split(" ")[1]
    : authorizationHeader;
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}
