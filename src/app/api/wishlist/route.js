// app/api/wishlist/route.js

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import User from "@/models/User";
import Buyer from "@/models/Buyer"; // 👈 Import Buyer model

// Helper function to get user ID from the request (KEEP AS IS)
const getUserIdFromRequest = async (req) => {
    // ... (Your original getUserIdFromRequest function)
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
    // NOTE: This assumes the token 'id' field works for both User and Buyer, which is a key assumption based on your setup.
    return decodedToken.id; 
};

// GET /api/wishlist - Fetch user's OR buyer's wishlist
export async function GET(req) {
    await connectdb();
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        // 🎯 NEW: Read the role from the query parameters
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role'); // Get role from query string: ?role=user or ?role=buyer

        let model;
        if (role === 'buyer') {
            model = Buyer; // Use Buyer model
        } else if (role === 'user') {
            model = User; // Use User model
        } else {
            // Default to User if role is not specified or invalid (or check both)
            model = User;
            console.warn("GET /api/wishlist called without a valid 'role' query parameter. Defaulting to User model.");
        }

        const person = await model.findById(userId).populate("wishlist");
        if (!person) {
            return NextResponse.json({ message: `${role} not found` }, { status: 404 });
        }
        return NextResponse.json({ wishlist: person.wishlist }, { status: 200 });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// POST /api/wishlist - Add a product to user's OR buyer's wishlist
export async function POST(req) {
    await connectdb();
    try {
        const userId = await getUserIdFromRequest(req);
        // 🎯 NEW: Read productId AND role from request body
        const { productId, role } = await req.json(); 

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (!productId) {
            return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
        }
        if (!role || (role !== 'user' && role !== 'buyer')) {
            return NextResponse.json({ message: "Role is required and must be 'user' or 'buyer'" }, { status: 400 });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        const model = role === 'buyer' ? Buyer : User;

        const person = await model.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).populate("wishlist");

        if (!person) {
            return NextResponse.json({ message: `${role} not found` }, { status: 404 });
        }

        return NextResponse.json({ message: "Product added to wishlist", wishlist: person.wishlist }, { status: 200 });
    } catch (error) {
        console.error("Error adding product to wishlist:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}