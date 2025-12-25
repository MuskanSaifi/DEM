// pages/api/buyer/delete/route.js
import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import { requireBuyerAuth } from "@/middlewares/requireBuyerAuth";

export async function DELETE(req) {
  await connectdb();

  try {
    const buyerAuth = await requireBuyerAuth(req); // returns { id, role }
    if (!buyerAuth) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    // Delete buyer by id
    await Buyer.findByIdAndDelete(buyerAuth.id);

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
