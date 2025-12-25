import connectdb from "@/lib/dbConnect";
import { requireBuyerAuth } from "@/middlewares/requireBuyerAuth";
import Buyer from "@/models/Buyer";
import mongoose from "mongoose";

export async function POST(req) {
  await connectdb();

  try {
    // ✅ Authenticate buyer using JWT
    const authBuyer = await requireBuyerAuth(req);

    if (!authBuyer || !authBuyer.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Convert ID to ObjectId for Mongo
    const buyerId = new mongoose.Types.ObjectId(authBuyer.id);

    // ✅ Update buyer termsAccepted field
    const buyer = await Buyer.findByIdAndUpdate(
      buyerId,
      { termsAccepted: true },
      { new: true }
    );

    if (!buyer) {
      return new Response(JSON.stringify({ error: "Buyer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Terms accepted successfully",
        buyer,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Accept Terms Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
