// api/auth/sendotp
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import connectdb from "@/lib/dbConnect";
import Bankdetails from "@/models/BankDetails";

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

        // Ensure mobile number is in E.164 format
        const formattedMobile = mobileNumber.startsWith("+") ? mobileNumber.slice(1) : `91${mobileNumber}`;

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
        const otpExpires = new Date(Date.now() + 5 * 60000);

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


        // Send OTP via 2Factor
        try {
            const apiKey = "afd6c091-063e-11f0-8b17-0200cd936042"; // Replace with environment variable
            const otpTemplateName = "OTPtemplate"; // Replace with your template name

            const response = await fetch(
                `https://2factor.in/API/V1/${apiKey}/SMS/${formattedMobile}/${otp}/${otpTemplateName}`,
                { method: "GET" }
            );

            const result = await response.json();

            if (response.ok && result.Status === "Success") {
                return new Response(JSON.stringify({ message: "OTP sent successfully", mobileNumber }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                console.error("2Factor Error:", result);
                return new Response(JSON.stringify({ error: "Failed to send OTP. Please try again." }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                });
            }
        } catch (apiError) {
            console.error("2Factor API Error:", apiError);
            return new Response(JSON.stringify({ error: "Failed to send OTP. Please try again." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
