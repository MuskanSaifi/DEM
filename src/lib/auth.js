// src/lib/auth.js
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";

export const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: "90d" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null; // Return null if verification fails
  }
};
