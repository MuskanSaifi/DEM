import Buyer from "@/models/Buyer";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
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

        let existingBuyer = await Buyer.findOne({ mobileNumber: formattedMobile });

        if (!existingBuyer) {
            if (await isBuyerNameTakenToday(fullname)) {
                return new Response(JSON.stringify({ error: SAME_NAME_TODAY_MESSAGE }), {
                    status: 409,
                    headers: { "Content-Type": "application/json" }
                });
            }
            // If buyer does not exist, create a new one
            existingBuyer = new Buyer({
                fullname,
                email,
                mobileNumber: formattedMobile,
                countryCode,
                companyName,
                productname: productname, // current product
                inquiredProducts: [productname] // list of products
            });
        } else {
            // If buyer exists, update product list if not already included
            if (!existingBuyer.inquiredProducts.includes(productname)) {
                existingBuyer.inquiredProducts.push(productname);
            }
            // Update current productname
            existingBuyer.productname = productname;
            // Optionally, update other fields (e.g., fullname, email, etc.) if needed
        }

        await existingBuyer.save();

        return new Response(JSON.stringify({ success: true, message: "Registration successful!", buyer: existingBuyer }), {
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
