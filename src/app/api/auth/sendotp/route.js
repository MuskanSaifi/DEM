// api/auth/sendotp
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import connectdb from "@/lib/dbConnect";
import Bankdetails from "@/models/BankDetails";
import { send2FactorOtp } from "@/lib/twoFactor";
import { getOtpExpireMinutes } from "@/lib/env";

export async function POST(req) {
    try {
        await connectdb(); // Connect to the database
        const body = await req.json();

        const { fullname, email, mobileNumber, pincode, companyName } = body;

        if (!fullname || !mobileNumber) {
            return new Response(JSON.stringify({ error: "All fields are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Check if mobile number already exists
        let existingUser = await User.findOne({ mobileNumber });

        if (existingUser) {
            return new Response(JSON.stringify({ error: "This number already exists. Please sign in." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ fullname, email, mobileNumber, pincode, companyName });
        } else {
            user.fullname = fullname;
            user.pincode = pincode;
            user.companyName = companyName;
        }

        // const otp = Math.floor(100000 + Math.random() * 900000);
        const otp = Math.floor(1000 + Math.random() * 9000);
        const otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60000);

        user.otp = otp;
        user.otpExpires = otpExpires;

        await user.save();

        // Check if BusinessProfile exists, if not, create one
        let businessProfile = await BusinessProfile.findOne({ userId: user._id });

        if (!businessProfile) {
            businessProfile = new BusinessProfile({
                userId: user._id,
                companyName,
                officeContact: mobileNumber, // Using mobileNumber as default office contact
                ownershipType: "",
                annualTurnover: "",
                yearOfEstablishment: new Date().getFullYear(),
                numberOfEmployees: 0,
                address: "",
                pincode,
                city: "",
                state: "",
                country: "India",
                gstNumber: "",
                aadharNumber: "",
                panNumber: "",
                iecNumber: "",
                tanNumber: "",
                vatNumber: "",
                companyLogo: "",
                companyPhotos: [],
                companyVideo: "",
                companyDescription: "",
                workingDays: [],
                workingTime: { from: "", to: "" },
                preferredBusinessStates: [],
                preferredBusinessCities: [],
                nonBusinessCities: [],
            });

            await businessProfile.save();
        }

        // Check if Bank Details exist, if not, create one
        let existingBankDetails = await Bankdetails.findOne({ userId: user._id });

        if (!existingBankDetails) {
            const newBankDetails = new Bankdetails({
                userId: user._id,
                accountType: "",
                accountHolderName: "",
                accountNumber: "",
                confirmAccountNumber: "",
                ifscCode: "",
                mobileLinked: "",
            });

            await newBankDetails.save();
        }


        const sent = await send2FactorOtp(mobileNumber, otp);
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
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
