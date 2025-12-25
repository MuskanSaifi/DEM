import jwt from "jsonwebtoken";
import Buyer from "@/models/Buyer";

export const requireBuyerAuth = async (req) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const buyer = await Buyer.findById(decoded.id);
    if (!buyer) return null;

    return { id: buyer._id, role: "buyer" };
  } catch (err) {
    console.error("Buyer auth error:", err);
    return null;
  }
};
