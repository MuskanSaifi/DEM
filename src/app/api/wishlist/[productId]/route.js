// app/api/wishlist/[productId]/route.js

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import Buyer from "@/models/Buyer"; // Import Buyer model

// 🎯 FIX: RE-ADD the Helper function here!
const getUserIdFromRequest = async (req) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("Unauthorized access attempt: No Bearer token in header.");
        return null;
    }
    const tokenString = authHeader.split(" ")[1];
    const decodedToken = verifyToken(tokenString);
    if (!decodedToken || !decodedToken.id) {
        console.warn("Unauthorized access attempt: Invalid or malformed token payload (missing 'id'). Token:", tokenString);
        return null;
    }
    return decodedToken.id;
};

// DELETE /api/wishlist/[productId] - Remove a product from wishlist
export async function DELETE(req, { params }) {
    await connectdb();
    try {
        // Line 15: This call now works because the function is defined above.
        const userId = await getUserIdFromRequest(req); 
        const { productId } = params; 

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (!productId) {
            return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
        }
        
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        if (!role || (role !== 'user' && role !== 'buyer')) {
            return NextResponse.json({ message: "Role is required and must be 'user' or 'buyer'" }, { status: 400 });
        }

        const model = role === 'buyer' ? Buyer : User;

        const person = await model.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: productId } },
            { new: true }
        ).populate("wishlist");

        if (!person) {
            return NextResponse.json({ message: `${role} not found` }, { status: 404 });
        }

        return NextResponse.json({ message: "Product removed from wishlist", wishlist: person.wishlist }, { status: 200 });
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}