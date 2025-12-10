import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Buyer from '@/models/Buyer'; // adjust this path as needed
import connectdb from '@/lib/dbConnect';

export async function POST(request) {
  try {
    await connectdb();
    const body = await request.json();

    const {
      fullname,
      email,
      mobileNumber,
      countryCode,
      productname, // <--- Now receiving productname from frontend
      // Removed: quantity, unit, orderValue, currency
    } = body;

    // Validate essential buyer fields
    if (!mobileNumber) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }
    if (!countryCode) {
      return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
    }
    if (!fullname) {
        return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    // productname is essential for this new logic, but not necessarily required by schema
    // if (!productname) {
    //     return NextResponse.json({ error: 'Product name is required for inquiry tracking' }, { status: 400 });
    // }

    // Check for existing buyer with the same mobileNumber
    let existingBuyer = await Buyer.findOne({ mobileNumber });

    if (existingBuyer) {
      let updated = false;
      
      // Update basic buyer info if different
      if (fullname && existingBuyer.fullname !== fullname) {
        existingBuyer.fullname = fullname;
        updated = true;
      }
      if (email && existingBuyer.email !== email) {
        existingBuyer.email = email;
        updated = true;
      }

      // Add productname to inquiredProducts array if it's not already there
      if (productname && !existingBuyer.inquiredProducts.includes(productname)) {
        existingBuyer.inquiredProducts.push(productname);
        updated = true;
      }

      if (updated) {
        await existingBuyer.save();
      }
      return NextResponse.json({ message: 'Buyer already exists and info/product updated', buyer: existingBuyer }, { status: 200 });
    }

    // If no existing buyer, create a new one
    const newBuyer = new Buyer({
      fullname,
      email,
      mobileNumber,
      countryCode,
      inquiredProducts: productname ? [productname] : [], // Initialize with current product if provided
    });

    await newBuyer.save();

    return NextResponse.json({ message: 'Buyer created successfully', buyer: newBuyer }, { status: 201 });

  } catch (error) {
    console.error('Error saving buyer:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      // Mongoose validation error might occur if, for example, unique: true fails for mobileNumber
      return NextResponse.json({ error: `Validation Error: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}