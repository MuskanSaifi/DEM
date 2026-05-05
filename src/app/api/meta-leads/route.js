import { NextResponse } from "next/server";
import MetaLead from "@/models/MetaLead";
import connectdb from "@/lib/dbConnect";

export async function POST(request) {
  try {
    await connectdb();

    const body = await request.json();

    const { fullName, mobileNumber, businessType, companyName, email, message } = body;

    if (!fullName || !mobileNumber || !businessType) {
      return NextResponse.json(
        { error: "Full Name, Mobile Number and Business Type are required." },
        { status: 400 }
      );
    }

    const lead = new MetaLead({
      fullName,
      mobileNumber,
      businessType,
      companyName,
      email,
      message,
    });

    await lead.save();

    return NextResponse.json(
      { message: "Thank you! Your enquiry has been submitted." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving meta lead:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to save data. Please try again later." },
      { status: 500 }
    );
  }
}
