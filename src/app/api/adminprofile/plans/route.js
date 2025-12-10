// app/api/adminprofile/plans/route.js
import { NextResponse } from "next/server";
import connectdb from "@/lib/dbConnect";
import PlansModel from "@/models/PlansModel";

// ✅ Get all plans
export async function GET() {
  try {
    await connectdb();
    const plans = await PlansModel.find().sort({ createdAt: 1 });
    return NextResponse.json(plans);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ Create new plan
export async function POST(req) {
  try {
    await connectdb();
    const body = await req.json();
    const plan = await PlansModel.create(body);
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ✅ Update plan
export async function PATCH(req) {
  try {
    await connectdb();
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const updated = await PlansModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ Delete plan
export async function DELETE(req) {
  try {
    await connectdb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id is required" }, { status: 400 });

    await PlansModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

