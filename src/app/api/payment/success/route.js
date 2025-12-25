// app/api/payment/success/route.js

import User from "@/models/User";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import plans from "@/app/become-a-member-old/PlansData";


export async function POST(req) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const userId = params.get("udf1");
    const status = params.get("status");
    const amountStr = params.get("amount");
    const txnid = params.get("txnid");
    const productInfo = params.get("productinfo");

console.log("Received productInfo:", productInfo);
console.log("Available plan titles:", plans.map(p => p.title));

    if (!userId || !status || !amountStr || !txnid || !productInfo) {
      return NextResponse.json({ success: false, message: "Missing required fields" });
    }

    const paidAmount = parseFloat(amountStr);
    if (isNaN(paidAmount)) {
      return NextResponse.json({ success: false, message: "Invalid amount format" });
    }

    if (status !== "success") {
      return NextResponse.json({ success: false, message: "Payment failed" });
    }

    // Match productInfo with plans to get base price

    // const matchedPlan = plans.find(plan => plan.title === productInfo);

    const matchedPlan = plans.find(
  plan => plan.title.trim().toLowerCase() === productInfo.trim().toLowerCase()
);


    if (!matchedPlan) {
      return NextResponse.json({ success: false, message: "Invalid package selected" });
    }

    const baseAmount = parseFloat(matchedPlan.price);
    const gstAmount = baseAmount * 0.18;
    const totalAmountWithGST = baseAmount + gstAmount;

    const remainingAmount = totalAmountWithGST - paidAmount;

    await connectdb();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const packageStartDate = new Date();
    const packageExpiryDate = new Date(packageStartDate);
    packageExpiryDate.setFullYear(packageStartDate.getFullYear() + 1);

    await User.findByIdAndUpdate(userId, {
      $push: {
        userPackage: {
          packageName: productInfo,
          totalAmount: totalAmountWithGST,
          paidAmount,
          remainingAmount,
          packageStartDate,
          packageExpiryDate,
          txnid,
        },
      },
    });

    // return NextResponse.json({ success: true, message: "Payment processed successfully" });


return new NextResponse(`
  <html>
    <head>
      <meta http-equiv="refresh" content="0; url=https://www.dialexportmart.com/payment-success?txnid=${txnid}&amount=${paidAmount}&package=${encodeURIComponent(productInfo)}" />
    </head>
    <body>
      Redirecting to payment success page...
    </body>
  </html>
`, {
  headers: {
    "Content-Type": "text/html"
  }
});


  } catch (err) {
    console.error("Error processing payment:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}