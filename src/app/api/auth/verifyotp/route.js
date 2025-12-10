// api/auth/verifyotp
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(req) {
    try {
        await connectdb();
        const body = await req.json(); // Parse the request body

        const { mobileNumber, otp } = body;
        if (!mobileNumber || !otp) {
            return new Response(JSON.stringify({ error: "Mobile number and OTP are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const user = await User.findOne({ mobileNumber, otp, otpExpires: { $gt: new Date() } });

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        user.isVerified = true;
        await user.save();

        const token = generateToken(user);

        return new Response(JSON.stringify({ message: "OTP verified successfully", token, user }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
