// api\adminprofile\supportmembers\[id]\route.js
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import SupportPerson from "@/models/SupportPerson";

export async function PATCH(req) {
  await connectdb();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Extract ID from the URL

  const body = await req.json();

  try {
    const updateFields = {};

    const {
      name,
      email,
      allSellerAccess,
      allBuyerAccess,
      allContactAccess,
      allSubscribersAccess,
      allPaymentsAccess,
    } = body;

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (allSellerAccess !== undefined) updateFields.allSellerAccess = allSellerAccess;
    if (allBuyerAccess !== undefined) updateFields.allBuyerAccess = allBuyerAccess;
    if (allContactAccess !== undefined) updateFields.allContactAccess = allContactAccess;
    if (allSubscribersAccess !== undefined) updateFields.allSubscribersAccess = allSubscribersAccess;
    if (allPaymentsAccess !== undefined) updateFields.allPaymentsAccess = allPaymentsAccess;

    const updated = await SupportPerson.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Support person not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req, context) {
  try {
    await connectdb();

    const { params } = context; // Access the entire params object
    const { id } = await params;   // Await the params and then extract id

    const member = await SupportPerson.findById(id).select("-password");

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Support member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}