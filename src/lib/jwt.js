// src/lib/jwt.js
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";

export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        getJwtSecret(),
        { expiresIn: "90d" }
    );
};


export const verifyToken = (token) => {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return null; // Return null if verification fails
    }
};