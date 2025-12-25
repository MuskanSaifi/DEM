import Buyer from '@/models/Buyer';
import connectdb from '@/lib/dbConnect';
import User from '@/models/User';
import purchaseRequestSchema from '@/models/purchaseRequestSchema';

export async function POST(req) {
  await connectdb();

  try {
    const {
      productname,
      quantity,
      unit,
      orderValue,
      currency,
      buyer, // now this is ObjectId
      requirementFrequency,
      seller, // <--- CORRECTED: This now correctly captures the 'seller' key from the frontend payload
      product
    } = await req.json(); // Use .json() to parse the request body

    
    // Validate if required fields are present individually
    if (!buyer) {
      return new Response(
        JSON.stringify({ error: 'Buyer is required' }),
        { status: 400 }
      );
    }

    // CHANGE THIS LINE: Validate the 'seller' variable
    if (!seller) { // <--- CORRECTED: Check 'seller' instead of 'sellerId'
      return new Response(
        JSON.stringify({ error: 'Seller ID is required' }),
        { status: 400 }
      );
    }

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { status: 400 }
      );
    }

    const newRequest = new purchaseRequestSchema({
      buyer, 
      seller: seller, // <--- CORRECTED: Use the 'seller' variable here too
      product: product,
      quantity,
      unit,
      approxOrderValue: {
        amount: orderValue,
        currency: currency || 'INR',
      },
      requirementFrequency: requirementFrequency.toLowerCase(),
    });

    await newRequest.save();
    return new Response(
      JSON.stringify({ message: 'Purchase request submitted successfully' }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase request:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong while submitting purchase request' }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return new Response(
    JSON.stringify({ error: 'Method Not Allowed' }),
    { status: 405 }
  );
}