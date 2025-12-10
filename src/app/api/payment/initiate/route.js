// app/api/payment/initiate/route.js

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  const body = await req.json();
  const { amount, email, phone, name, userId, packageName, productInfo } = body; // Destructure productInfo

  // Check if we're using test mode or live mode
  const payuMode = process.env.PAYU_MODE; // "test" or "live"
  
  // Set the correct PayU credentials and API endpoint based on the mode
  const key = payuMode === "test" 
    ? process.env.PAYU_MERCHANT_KEY_TEST 
    : process.env.PAYU_MERCHANT_KEY_LIVE;

  const salt = payuMode === "test" 
    ? process.env.PAYU_MERCHANT_SALT_TEST 
    : process.env.PAYU_MERCHANT_SALT_LIVE;

  const txnid = `txn_${Date.now()}`;

  // Default udf fields as empty strings if not provided
  const udf1 = userId || "";
  const udf2 = body.totalAmount || ""; // 👈 Store totalAmount here
  const udf3 = "";
  const udf4 = "";
  const udf5 = "";
  const udf6 = "";
  const udf7 = "";
  const udf8 = "";
  const udf9 = "";
  const udf10 = "";

  // Ensure 'amount' is a string, as PayU expects a string value
  const amountStr = String(amount);

  // Correct the hash string as per PayU's specified format
  const hashString = `${key}|${txnid}|${amountStr}|${productInfo}|${name}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

  // Debug logs for hash string
  console.log("Hash String:", hashString);

  // Calculate the hash using SHA512
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  // Log the final hash
  console.log("Generated Hash:", hash);

  // Determine the action URL based on Test Mode or Live Mode
  const payuActionUrl = payuMode === "test"
    ? "https://test.payu.in/_payment" // Test (sandbox) URL
    : "https://secure.payu.in/_payment"; // Live (production) URL

  // Construct the response to send to PayU
  const response = {
    action: payuActionUrl, // Use the appropriate URL
    params: {
      key,
      txnid,
      amount: amountStr,
      firstname: name,
      email,
      phone,  // Keep phone here for the request, though it's not part of the hash string
      surl: `https://www.dialexportmart.com/api/payment/success`,
      furl: `https://www.dialexportmart.com/api/payment/failure`,
      hash,
      productinfo: productInfo, // Added product info
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
    }
  };

  console.log("Payment Request to PayU:", response);  // Log the final payment request
  return NextResponse.json(response);
}
