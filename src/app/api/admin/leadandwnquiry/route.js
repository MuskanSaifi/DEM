import { NextResponse } from 'next/server';
import connectdb from '@/lib/dbConnect';
import purchaseRequestSchema from '@/models/purchaseRequestSchema';
import User from '@/models/User';
import Buyer from '@/models/Buyer';
import Product from '@/models/Product';

// GET all leads or inquiries
// buyer can be Buyer or User (when seller places enquiry) — use refPath + manual fallback for old docs
export async function GET(request) {
  try {
    await connectdb();
    const raw = await purchaseRequestSchema
      .find()
      .populate('seller', 'userProfileSlug fullname email mobileNumber userPackage')
      .populate('product', 'name price currency images description')
      .lean();

    const data = await Promise.all(
      raw.map(async (lead) => {
        if (!lead.buyer) return { ...lead, buyer: null };
        const isUser = lead.buyerModel === 'User';
        const model = isUser ? User : Buyer;
        let buyerDoc = await model
          .findById(lead.buyer)
          .select('fullname email mobileNumber')
          .lean();
        // Old leads: buyer may hold User id but buyerModel was missing → try User
        if (!buyerDoc && !isUser) {
          buyerDoc = await User.findById(lead.buyer)
            .select('fullname email mobileNumber')
            .lean();
        }
        return { ...lead, buyer: buyerDoc };
      })
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
