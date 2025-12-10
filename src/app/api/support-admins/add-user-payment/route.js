import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import UserPayment from "@/models/UserPayment";
import SupportPerson from "@/models/SupportPerson";

export async function POST(req) {
  try {
    await connectdb();

    const {
      fullname,
      email,
      mobileNumber,
      companyName,
      supportPerson,
      packageName,
      totalAmount,
      paidAmount,
      remainingAmount,
      packageStartDate,
      packageExpiryDate,
      orderId,
      transactionId,
      paymentMethod,
      payerEmail,
      payerMobile,
      paymentResponse,
    } = await req.json();

    if (!mobileNumber) {
      return NextResponse.json({ success: false, message: "Mobile number is required" }, { status: 400 });
    }

    // 1. Find user by mobile number
    let user = await User.findOne({ mobileNumber });

    // 2. Create new user if not found
    if (!user) {
      user = new User({
        fullname,
        email,
        mobileNumber,
        companyName,
        supportPerson,
        userPackage: [],
        userPackageHistory: [],
      });
    }

    // 3. Add package to user.userPackage array
    const newPackage = {
      packageName,
      totalAmount,
      paidAmount,
      remainingAmount,
      packageStartDate,
      packageExpiryDate,
    };
    user.userPackage.push(newPackage);
    await user.save();

    // 3.b. Add this user to the support person's clients list
    if (supportPerson) {
     await SupportPerson.findByIdAndUpdate(
  supportPerson,
  { $addToSet: { clients: user._id } }
);
    }

    // 4. Save payment info in UserPayment collection
    const newPayment = new UserPayment({
      userId: user._id,
      orderId,
      transactionId,
      amount: paidAmount,
      paymentMethod,
      paymentStatus: "Success",
      payerEmail,
      payerMobile,
      paymentResponse,
      packageExpiry: packageExpiryDate,
    });
    await newPayment.save();

    return NextResponse.json({ success: true, message: "User package and payment added" }, { status: 201 });

  } catch (error) {
    console.error("Error in add-user-payment:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}



export async function GET() {
  try {
    await connectdb();

    const supportPersons = await SupportPerson.find().select("-password"); // exclude passwords

    return NextResponse.json({ success: true, data: supportPersons }, { status: 200 });
  } catch (error) {
    console.error("Error fetching support persons:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}