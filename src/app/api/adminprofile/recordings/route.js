import { NextResponse } from 'next/server';
import connectdb from "@/lib/dbConnect";
import SupportPerson from '@/models/SupportPerson';



export async function GET() {
  try {
    await connectdb();

    const supportPeople = await SupportPerson.find(); 

    return NextResponse.json({ success: true, data: supportPeople });
  } catch (error) {
    console.error('Error fetching support people:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch support people' }, { status: 500 });
  }
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
          'recordingurl.$.adminmessages': { text, sentAt: new Date() },
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