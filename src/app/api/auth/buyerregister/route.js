import Buyer from "@/models/Buyer";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";

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

        let existingBuyer = await Buyer.findOne({ mobileNumber: formattedMobile });

        if (!existingBuyer) {
            // If buyer does not exist, create a new one
            existingBuyer = new Buyer({
                fullname,
                email,
                mobileNumber: formattedMobile,
                countryCode,
                companyName,
                productname: productname // ✅ Pass string as string
            });
        } else {
            // If buyer exists, update product list if not already included
            if (!existingBuyer.productname.includes(productname)) {
                existingBuyer.productname.push(productname);
            }
            // Optionally, update other fields (e.g., fullname, email, etc.) if needed
        }

        await existingBuyer.save();

        return new Response(JSON.stringify({ success: true, buyer: existingBuyer }), {
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
