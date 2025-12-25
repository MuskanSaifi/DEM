// api/user/accept-terms/route.js
import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/requireSignIn";
import User from "@/models/User";
import mongoose from "mongoose"; // <-- Import mongoose

export async function POST(req) {
  await connectdb();

  try {
    const authUser = await requireSignIn(req);

    if (!authUser || !authUser.id) { // <-- Added check for authUser.id
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Explicitly convert the ID to a Mongoose ObjectId
    const userId = new mongoose.Types.ObjectId(authUser.id);

    const user = await User.findByIdAndUpdate(
      userId, // <-- Use the converted ID
      { termsAccepted: true },
      { new: true }
    );

    // If the user isn't found, it's a 404 (Not Found) error, not a server error
    if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true, user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // If conversion fails, it will also be caught here
    console.error("Accept Terms Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}