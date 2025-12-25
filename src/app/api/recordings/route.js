import { NextResponse } from 'next/server';
import fs from 'fs/promises'; // Use promise-based fs API
import path from 'path';
import connectdb from '@/lib/dbConnect';
import SupportPerson from '@/models/SupportPerson';

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const recordingId = searchParams.get("id"); // this should be the _id of the recording
  const supportPersonId = searchParams.get("supportPersonId");

  if (!recordingId || !supportPersonId) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  await connectdb();

  const person = await SupportPerson.findById(supportPersonId);
  if (!person) {
    return NextResponse.json({ message: 'Support person not found' }, { status: 404 });
  }

  // Find the recording by _id (Mongoose object _id inside recordingurl array)
  const recordingIndex = person.recordingurl.findIndex(r => r._id.toString() === recordingId);
  if (recordingIndex === -1) {
    return NextResponse.json({ message: 'Recording not found' }, { status: 404 });
  }

  const recording = person.recordingurl[recordingIndex];
  const recordingUrl = recording.url;

  // Get filename from URL
  let filename = recordingUrl;
  if (typeof recordingUrl === 'string' && recordingUrl.includes('/')) {
    filename = recordingUrl.split('/').pop();
  }

  const baseUploadPath = path.join(process.cwd(), 'public/uploads');
  const filePath = path.join(baseUploadPath, filename);

  // Remove file
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.warn("File not found or already deleted:", err.message);
  }

  // Remove recording from database
  person.recordingurl.splice(recordingIndex, 1);
  await person.save();

return NextResponse.json({ success: true, message: 'Recording deleted successfully' }, { status: 200 });
}

export async function GET(req) {
  await connectdb();

  const url = new URL(req.url);
  const supportPersonId = url.searchParams.get("supportPersonId");

  if (!supportPersonId) {
    return NextResponse.json({ message: "supportPersonId is required" }, { status: 400 });
  }

  const person = await SupportPerson.findById(supportPersonId);

  if (!person) {
    return NextResponse.json({ message: "Support person not found" }, { status: 404 });
  }

  return NextResponse.json({ files: person.recordingurl });
}

export async function PATCH(req) {
  await connectdb();

  try {
    const body = await req.json();
    const { supportPersonId, recordingUrl, text } = body;

    if (!supportPersonId || !recordingUrl || !text) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Update the message array using MongoDB's positional operator
    const updated = await SupportPerson.findOneAndUpdate(
      {
        _id: supportPersonId,
        'recordingurl.url': recordingUrl,
      },
      {
        $push: {
          'recordingurl.$.messages': { text, sentAt: new Date() },
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Support person or recording not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Message added successfully', data: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



