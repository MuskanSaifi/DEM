import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";
import { generateToken } from "@/lib/jwt";

export async function POST(req) {
    try {
        await connectdb();
        const body = await req.json();

        const { mobileNumber, otp } = body;

        if (!mobileNumber || !otp) {
            return new Response(JSON.stringify({ error: "Mobile number and OTP are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Find the buyer with matching OTP
        const buyer = await Buyer.findOne({ 
            mobileNumber, 
            otp: otp.toString(), 
            otpExpires: { $gt: new Date() } 
        });

        if (!buyer) {
            console.error("❌ Invalid or Expired OTP:", otp, "for mobile:", mobileNumber);
            return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ✅ Mark buyer as verified & remove OTP
        buyer.isVerified = true;
        buyer.otp = undefined;
        buyer.otpExpires = undefined;
        await buyer.save();

        // ✅ Generate auth token
        const token = generateToken(buyer);

        return new Response(JSON.stringify({ message: "OTP verified successfully", token }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
