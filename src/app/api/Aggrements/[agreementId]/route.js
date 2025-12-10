import { NextResponse } from 'next/server';
import Agreement from '@/models/Agreement';
import connectdb from '@/lib/dbConnect';
import cloudinary from '@/lib/cloudinary';

// GET a specific agreement
export async function GET(request, { params }) {
  await connectdb();
  try {
    const { agreementId } = params; // Directly access params object
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return NextResponse.json({ success: false, message: 'Agreement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: agreement });
  } catch (error) {
    console.error("GET by ID error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT (Update) a specific agreement
export async function PUT(request, { params }) {
  await connectdb();
  try {
    const { agreementId } = params; // Directly access params object
    const body = await request.json();
    const updateData = { ...body };

    // Check if a signature image is being sent
    if (body.signatureImage) {
      try {
        const result = await cloudinary.uploader.upload(body.signatureImage, {
          folder: 'signatures',
          resource_type: 'image',
        });
        updateData.signatureImage = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ success: false, message: 'Failed to upload signature image' }, { status: 500 });
      }
    }

    const updatedAgreement = await Agreement.findByIdAndUpdate(agreementId, updateData, { new: true, runValidators: true });
    if (!updatedAgreement) {
      return NextResponse.json({ success: false, message: 'Agreement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedAgreement });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE a specific agreement
export async function DELETE(request, { params }) {
  await connectdb();
  try {
    const { agreementId } = params; // Directly access params object
    const deletedAgreement = await Agreement.findByIdAndDelete(agreementId);
    if (!deletedAgreement) {
      return NextResponse.json({ success: false, message: 'Agreement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deletedAgreement });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}