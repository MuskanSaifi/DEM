// api/auth/testsendotp

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Bankdetails from "@/models/BankDetails";
import connectdb from "@/lib/dbConnect";
import { getTestOtpCode, getOtpExpireMinutes } from "@/lib/env";

export async function POST(req) {
    try {
        await connectdb();
        const body = await req.json();

        const { fullname, email, mobileNumber, pincode, companyName } = body;

        console.log("BODY RECEIVED:", body);

        // ⭐ REQUIRED FIELDS CHECK
        if (!fullname || !mobileNumber) {
            return new Response(JSON.stringify({ error: "All fields required" }), { status: 400 });
        }

        const finalMobile = mobileNumber.trim();

        // ⭐ CHECK IF MOBILE EXISTS
        const existingMobile = await User.findOne({ mobileNumber: finalMobile });
        if (existingMobile) {
            return new Response(JSON.stringify({ error: "Mobile number already registered" }), { status: 400 });
        }

        // ⭐ CHECK EMAIL DUPLICATE ONLY IF EMAIL PROVIDED
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return new Response(JSON.stringify({ error: "Email already registered" }), { status: 400 });
            }
        }

        // ⭐ CREATE USER
        let user = new User({
            fullname,
            email,
            mobileNumber: finalMobile,
            pincode,
            companyName,
        });

        const testOtp = getTestOtpCode();
        if (!testOtp) {
            return new Response(JSON.stringify({ error: "TEST_OTP_CODE is not configured" }), { status: 500 });
        }
        user.otp = testOtp;
        user.otpExpires = new Date(Date.now() + getOtpExpireMinutes() * 60 * 1000);

        await user.save(); // Save User First



        // ⭐⭐⭐ 1) CREATE BUSINESS PROFILE (same as sendotp) ⭐⭐⭐

        let businessProfile = await BusinessProfile.findOne({ userId: user._id });

        if (!businessProfile) {
            businessProfile = new BusinessProfile({
                userId: user._id,
                companyName,
                officeContact: finalMobile,
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



        // ⭐⭐⭐ 2) CREATE BANK DETAILS (same as sendotp) ⭐⭐⭐

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



        // ⭐ SUCCESS RESPONSE
        return new Response(
            JSON.stringify({
                success: true,
                message: "Test OTP sent successfully",
                otp: testOtp,
                mobileNumber: finalMobile,
            }),
            { status: 200 }
        );

    } catch (err) {
        console.log("Error in testsendotp:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
