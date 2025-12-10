import { NextResponse } from "next/server";
import Contact from "@/models/Contact";
import connectdb from "@/lib/dbConnect";

export async function POST(request) {
  try {
    await connectdb();

    const body = await request.json();

    const contact = new Contact(body);

    await contact.save();

    return NextResponse.json(
      { message: "Your message has been sent successfully!" },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);

      return NextResponse.json(
        {
          error: "Validation failed",
          messages: errors,
        },
        { status: 400 }
      );
    }

    console.error("Error saving contact:", error);

    return NextResponse.json(
      {
        error: "Failed to save contact. Please try again later.",
      },
      { status: 500 }
    );
  }
}



export async function GET() {
    try {
      await connectdb();
  
      const contacts = await Contact.find();
  
      return NextResponse.json(
        {
          message: "Contacts retrieved successfully",
          contacts,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error retrieving contacts:", error);
  
      return NextResponse.json(
        {
          error: "Failed to retrieve contacts. Please try again later.",
        },
        { status: 500 }
      );
    }
  }
