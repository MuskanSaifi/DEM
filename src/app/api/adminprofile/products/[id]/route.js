import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";



export async function PATCH(req, context) {
    const params = await context.params; // ✅ Await params if needed
  
    if (!params || !params.id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const id = params.id;

    const { tags } = await req.json();
    if (!tags || typeof tags !== "object") {
      return NextResponse.json({ error: "Tags object is required" }, { status: 400 });
    }

    await connectdb();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { tags } },
      { new: true, select: "tags" }
    );
  
    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
      return NextResponse.json({ success: true, message: "Tags updated successfully", tags: updatedProduct.tags }, { status: 200 });
  }
  
  
