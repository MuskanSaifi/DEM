import connectdb from "@/lib/dbConnect";
import { requireSignIn } from "@/middlewares/adminrequireSignin";
import SupportPerson from "@/models/SupportPerson";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server"; // You missed importing this

export async function POST(req) {
  try {
    await connectdb();

    // ✅ Check Admin Authorization
    const admin = await requireSignIn(req);
    if (!admin) {
      console.error("❌ Authorization failed. Admin not found.");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, number } = body;

    if (!name || !email || !password || !number) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // ✅ Check for existing support person
    const existing = await SupportPerson.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Support person already exists" }, { status: 409 });
    }

    // ✅ Save new support person
    const supportPerson = new SupportPerson({ name, email, password, number });
    await supportPerson.save();

    return NextResponse.json({ success: true, supportPerson }, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating support person:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { supportPersonId, clientIds } = body;

    // Validate supportPersonId
    if (!mongoose.Types.ObjectId.isValid(supportPersonId)) {
      return NextResponse.json({ success: false, message: "Invalid SupportPerson ID" }, { status: 400 });
    }

    const validClientIds = clientIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    // 1. Find previously assigned clients
    const supportPerson = await SupportPerson.findById(supportPersonId);
    if (!supportPerson) {
      return NextResponse.json({ success: false, message: "Support person not found" }, { status: 404 });
    }

    const previousClientIds = supportPerson.clients.map(id => id.toString());

    // 2. Find users to unassign (previously assigned but now removed)
    const unassignedClientIds = previousClientIds.filter(
      id => !validClientIds.includes(id)
    );

    // 3. Unassign supportPerson from removed users
    if (unassignedClientIds.length > 0) {
      await User.updateMany(
        { _id: { $in: unassignedClientIds } },
        { $unset: { supportPerson: "" } }
      );
    }

    // 4. Assign supportPerson to new/remaining users
    if (validClientIds.length > 0) {
      await User.updateMany(
        { _id: { $in: validClientIds } },
        { $set: { supportPerson: supportPersonId } }
      );
    }

    // 5. Update SupportPerson's client list
    const updatedSupportPerson = await SupportPerson.findByIdAndUpdate(
      supportPersonId,
      { clients: validClientIds },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Clients updated successfully",
      data: updatedSupportPerson,
    });

  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectdb();
    // ✅ Authorization Check
    const admin = await requireSignIn(req);
    if (!admin) {
      console.error("❌ Authorization failed. Admin not found.");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    // ✅ Fetch all support members, excluding passwords
    const members = await SupportPerson.find()
    .select('-password') // exclude password field
    .populate('clients'); // fetch full client info

    return NextResponse.json({ success: true, members }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching support members:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectdb();

    // ✅ Authorization
    const admin = await requireSignIn(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json(); // 👈 Get ID from request body

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const deletedPerson = await SupportPerson.findByIdAndDelete(id);
    if (!deletedPerson) {
      return NextResponse.json({ success: false, message: "Support person not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Support person deleted successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}