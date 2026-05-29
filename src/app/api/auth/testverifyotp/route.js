// api/auth/testveerifyotp
import User from "@/models/User";
import connectdb from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import { getJwtSecret, getTestOtpCode } from "@/lib/env";

export async function POST(req) {
    try {
        await connectdb();
        const { mobileNumber, otp } = await req.json();

        if (!mobileNumber || !otp) {
            return new Response(JSON.stringify({ error: "All fields required" }), { status: 400 });
        }

        const testOtp = getTestOtpCode();
        if (!testOtp || otp !== testOtp) {
            return new Response(JSON.stringify({ error: "Invalid OTP" }), { status: 400 });
        }

        const user = await User.findOne({
            mobileNumber,
            otp: testOtp,
            otpExpires: { $gt: new Date() },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), { status: 400 });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            getJwtSecret(),
            { expiresIn: "30d" }
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: "OTP verified",
                token,
                user,
            }),
            { status: 200 }
        );

    } catch (err) {
        console.log("verify error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
