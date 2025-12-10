import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";
import { connectDB } from "./db";

export const verifyAdmin = async (req) => {
  await connectDB();

  const token = req.cookies.get("adminToken")?.value;
  if (!token) throw new Error("Not authorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    return admin;
  } catch (error) {
    throw new Error("Invalid Token");
  }
};
