import { getJwtSecret } from "@/lib/env";
import jwt from "jsonwebtoken";

/** Roles allowed for DEM Calling (uses existing sales login tokens). */
export const CALLING_ROLES = ["sales-admin", "sales-employee"];

export async function verifyCallingToken(req, allowedRoles = []) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret());
    if (!CALLING_ROLES.includes(decoded.role)) return null;
    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) return null;

    return decoded;
  } catch {
    return null;
  }
}

export function isSalesAdmin(user) {
  return user?.role === "sales-admin";
}

export function isSalesEmployee(user) {
  return user?.role === "sales-employee";
}
