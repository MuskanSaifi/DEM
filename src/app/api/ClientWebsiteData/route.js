// api/ClientWebsiteData/route.js
import { NextResponse } from "next/server";
import ClientWebsiteData from "@/models/Clientwebsitedata.js";

import connectdb from "@/lib/dbConnect";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ✅ Allow requests from any domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};


// POST request
export async function POST(request) {
  try {
    await connectdb();

    const body = await request.json();
    if (!body.websitename) {
      return NextResponse.json(
        { error: "websitename is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const clientdata = new ClientWebsiteData(body);
    await clientdata.save();

    return NextResponse.json(
      { message: "Your message has been sent successfully!" },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error saving clientdata:", error);

    const errorMessage =
      error.name === "ValidationError"
        ? {
            error: "Validation failed",
            messages: Object.values(error.errors).map((err) => err.message),
          }
        : { error: "Failed to save clientdata. Please try again later." };

    return NextResponse.json(errorMessage, {
      status: error.name === "ValidationError" ? 400 : 500,
      headers: corsHeaders,
    });
  }
}

// OPTIONS method (for preflight request)
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders,
  });
}




// ✅ GET method to fetch all data
export async function GET() {
  try {
    
    await connectdb();
    const data = await ClientWebsiteData.find(); // Fetch all data
    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error fetching client data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500, headers: corsHeaders }
    );
  }
}
