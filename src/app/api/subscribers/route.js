import { NextResponse } from "next/server";
import Subscriber from "@/models/Subscriber";
import connectdb from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await connectdb(); // Ensure DB connection

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json({ success: false, message: "Email already subscribed" }, { status: 409 });
    }

    // Save new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 201 });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectdb(); // Ensure DB connection

    const subscribers = await Subscriber.find({}).select("email createdAt"); // Fetch all subscribers

    return NextResponse.json({ success: true, subscribers }, { status: 200 });

  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
