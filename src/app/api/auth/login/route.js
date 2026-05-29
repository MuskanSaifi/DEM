import User from "@/models/User";
import connectdb from "@/lib/dbConnect";
import { generateToken } from "@/lib/jwt";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getTestOtpPhone, getTestOtpCode, getOtpExpireMinutes } from "@/lib/env";

export async function POST(req) {
    try {
        await connectdb();
        const body = await req.json();
        const { mobileNumber, otp } = body;

        if (!mobileNumber) {
            return new Response(JSON.stringify({ error: "Mobile number is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const testNumber = getTestOtpPhone();
        const testOtp = getTestOtpCode();

        const formattedMobile = mobileNumber.startsWith("+") ? mobileNumber.slice(1) : `91${mobileNumber}`;

        // ========== OTP Send ==========
        if (!otp) {
            if (testNumber && mobileNumber === testNumber) {
                return new Response(JSON.stringify({ message: "Static OTP enabled for test account", mobileNumber }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const user = await User.findOne({ mobileNumber });
            if (!user) {
                return new Response(JSON.stringify({ error: "User not found, please register first" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const generatedOtp = Math.floor(1000 + Math.random() * 9000);
            const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60000);

            user.otp = generatedOtp;
            user.otpExpires = otpExpires;
            await user.save();

            const sent = await send2FactorOtp(mobileNumber, generatedOtp);
            if (!sent.ok) {
                return new Response(JSON.stringify({ error: sent.error || "Failed to send OTP. Please try again." }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response(JSON.stringify({ message: "OTP sent successfully", mobileNumber }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ========== OTP Verify ==========
        if (testNumber && testOtp && mobileNumber === testNumber && otp === testOtp) {
            let user = await User.findOne({ mobileNumber });
            if (!user) {
                user = new User({ mobileNumber, isVerified: true });
                await user.save();
            }

            const token = generateToken(user);
            return new Response(JSON.stringify({ message: "Login successful (Test Account)", token, user }), {
                status: 200,
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
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = generateToken(user);

        return new Response(JSON.stringify({
            message: "Login successful",
            token,
            user: {
                ...user.toObject(),
                termsAccepted: user.termsAccepted,
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in login API:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
