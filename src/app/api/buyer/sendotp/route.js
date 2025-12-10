import connectdb from "@/lib/dbConnect";
import Buyer from "@/models/Buyer";

export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { fullname, email, mobileNumber, countryCode, productname } = body;

    if (!fullname || !mobileNumber || !countryCode) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Always use formatted number in DB and everywhere
    const formattedMobile = `${countryCode}${mobileNumber}`;

    // ✅ Check if buyer already exists using same format
    let existingBuyer = await Buyer.findOne({ mobileNumber: formattedMobile });

    if (existingBuyer) {
      return new Response(
        JSON.stringify({ error: "This number already exists. Please login." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Create new buyer
    const newBuyer = new Buyer({
      fullname,
      email,
      mobileNumber: formattedMobile,
      countryCode,
      productname,
      otp,
      otpExpires,
    });

    await newBuyer.save();

    // ✅ Send OTP via 2Factor
    try {
      const apiKey = "afd6c091-063e-11f0-8b17-0200cd936042"; // ideally from process.env
      const templateName = "OTPtemplate";

      const response = await fetch(
        `https://2factor.in/API/V1/${apiKey}/SMS/${formattedMobile}/${otp}/${templateName}`,
        { method: "GET" }
      );

      const result = await response.json();

      if (response.ok && result.Status === "Success") {
        return new Response(
          JSON.stringify({
            message: "OTP sent successfully",
            mobileNumber: formattedMobile,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        console.error("2Factor Error:", result);
        return new Response(
          JSON.stringify({ error: "Failed to send OTP. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (otpError) {
      console.error("OTP API Error:", otpError);
      return new Response(
        JSON.stringify({ error: "Failed to send OTP" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
