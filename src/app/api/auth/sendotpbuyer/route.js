import Buyer from "@/models/Buyer";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import User from "@/models/User";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getOtpExpireMinutes } from "@/lib/env";
import { isBuyerNameTakenToday, SAME_NAME_TODAY_MESSAGE } from "@/lib/buyerDailyNameLimit";

export async function POST(req) {
    try {
        await connectdb();
        const body = await req.json();
        const { fullname, email, mobileNumber, countryCode, companyName, productname, otp } = body;
        if (!mobileNumber || !productname || !countryCode) {
            return new Response(JSON.stringify({ error: "All fields (including country code) are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const formattedMobile = mobileNumber.startsWith("+") ? mobileNumber : `${countryCode}${mobileNumber}`;
        let existingBuyer = await Buyer.findOne({ mobileNumber });

        if (!existingBuyer) {
            if (await isBuyerNameTakenToday(fullname)) {
                return new Response(JSON.stringify({ error: SAME_NAME_TODAY_MESSAGE }), {
                    status: 409,
                    headers: { "Content-Type": "application/json" }
                });
            }
            existingBuyer = new Buyer({ fullname, email, mobileNumber, countryCode, companyName, productname });
        }

        // ✅ Step 1: Send OTP if not provided
        if (!otp) {
            // const generatedOtp = Math.floor(100000 + Math.random() * 900000);
            const generatedOtp = Math.floor(1000 + Math.random() * 9000);
            existingBuyer.otp = generatedOtp;
            existingBuyer.otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60000);
            await existingBuyer.save();

            const sent = await send2FactorOtp(formattedMobile, generatedOtp);
            if (!sent.ok) {
                return new Response(JSON.stringify({ error: sent.error || "Failed to send OTP. Please try again." }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }

            return new Response(JSON.stringify({ message: "OTP sent successfully", mobileNumber }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ✅ Step 2: If OTP is provided, verify OTP and send product details
        if (existingBuyer.otp !== otp || new Date() > existingBuyer.otpExpires) {
            return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // OTP verified - Find matching products
        const matchingProducts = await Product.find({ name: productname }).populate("userId", "fullname");

        if (!matchingProducts.length) {
            return new Response(JSON.stringify({ message: "No matching products found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Format product details with seller info
        const productDetails = matchingProducts.map((p) => ({
            name: p.name,
            price: p.price,
            seller: p.userId ? p.userId.fullname : "Unknown",
            url: p.url || "No Link",
        }));

        return new Response(JSON.stringify({ message: "OTP verified", productDetails }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("❌ Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
