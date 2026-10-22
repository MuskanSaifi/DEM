import { NextResponse } from 'next/server';
import connectdb from '@/lib/dbConnect';
import cloudinary from '@/lib/cloudinary';
import SupportPerson from '@/models/SupportPerson';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');
    const supportPersonId = formData.get('supportPersonId');
    const message = formData.get('message');

    if (!file || !supportPersonId) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await connectdb();

    const person = await SupportPerson.findById(supportPersonId);
    if (!person) {
      return NextResponse.json({ message: 'Support person not found' }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Cloudinary stores audio under resource_type "video"
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'support-recordings', resource_type: 'video' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if (!Array.isArray(person.recordingurl)) {
      person.recordingurl = [];
    }

    // .ogg / .amr don't play in every browser; Cloudinary transcodes on delivery by extension
    const playableUrl = uploadRes.secure_url.replace(/\.[^./]+$/, '.mp3');

    person.recordingurl.push({
      url: playableUrl,
      public_id: uploadRes.public_id,
      uploadTime: new Date(),
      messages: message ? [{ text: message }] : [],
    });

    await person.save();

    return NextResponse.json({ message: 'Upload successful' });
  } catch (error) {
    console.error('Recording upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
