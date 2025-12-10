// api/Aggrements/aggrements/route.js
import { NextResponse } from 'next/server';
import Agreement from '@/models/Agreement';
import connectdb from '@/lib/dbConnect';

// GET all agreements from the database.
// This route will handle requests to /api/Aggrements/aggrements
export async function GET() {
  await connectdb();
  try {
    const agreements = await Agreement.find({});
    return NextResponse.json({ success: true, data: agreements });
  } catch (error) {
    console.error("GET all error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST a new agreement (for a user request).
// This route will handle POST requests to /api/Aggrements/aggrements
export async function POST(request) {
  await connectdb();
  try {
    const body = await request.json();
    const agreement = await Agreement.create(body);
    return NextResponse.json({ success: true, data: agreement }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
