import { NextResponse } from 'next/server';
import connectdb from '@/lib/dbConnect';
import purchaseRequestSchema from '@/models/purchaseRequestSchema';
import User from '@/models/User';
import Buyer from '@/models/Buyer';
import Product from '@/models/Product';

// GET all leads or inquiries
export async function GET(request) {
  try {
    await connectdb(); 
    const data = await purchaseRequestSchema.find()
    .populate('buyer', 'fullname email mobileNumber') // Buyer model
    .populate('seller', 'userProfileSlug fullname email mobileNumber userPackage') // User model
    .populate('product', 'name price currency images description'); // Product model
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
