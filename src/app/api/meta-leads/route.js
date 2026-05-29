import { NextResponse } from "next/server";
import MetaLead from "@/models/MetaLead";
import connectdb from "@/lib/dbConnect";
import { sendEmail } from "@/lib/sendEmail";
import { getMetaLeadsEmail } from "@/lib/env";

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

    const leadUrl = "https://www.dialexportmart.com/dashboard";
    const createdAt = new Date(lead.createdAt || Date.now());
    const createdAtString = createdAt.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const emailTo = getMetaLeadsEmail();
    const subject = "New Meta Lead Received";
    const html = `
      <p>You got a new meta-lead submission.</p>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
      <p><strong>Business Type:</strong> ${businessType}</p>
      <p><strong>Company / Brand:</strong> ${companyName || "N/A"}</p>
      <p><strong>Email:</strong> ${email || "N/A"}</p>
      <p><strong>Message:</strong> ${message || "N/A"}</p>
      <p><strong>Submitted At:</strong> ${createdAtString}</p>
      <p><a href="${leadUrl}">Open Dashboard</a></p>
    `;

    try {
      await sendEmail({
        to: emailTo,
        subject,
        html,
        text: `You got a new meta-lead submission. Full Name: ${fullName}, Mobile: ${mobileNumber}, Business Type: ${businessType}, Company: ${companyName || "N/A"}, Email: ${email || "N/A"}, Message: ${message || "N/A"}, Submitted At: ${createdAtString}. Open dashboard: ${leadUrl}`,
      });
    } catch (emailError) {
      console.error("Meta lead email notification failed:", emailError);
    }

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
