import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';
import connectdb from '@/lib/dbConnect';
import SupportPerson from '@/models/SupportPerson';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('audio');
  const supportPersonId = formData.get('supportPersonId');
  const message = formData.get('message');

  if (!file || !supportPersonId) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name;
  const filePath = path.join(process.cwd(), 'public/uploads', filename);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  const url = `/uploads/${filename}`;

  await connectdb();

  const person = await SupportPerson.findById(supportPersonId);
  if (!person) {
    return NextResponse.json({ message: 'Support person not found' }, { status: 404 });
  }

  if (!Array.isArray(person.recordingurl)) {
    person.recordingurl = [];
  }

  const alreadyExists = person.recordingurl.some(r => r.url === url);
  if (!alreadyExists) {
    person.recordingurl.push({
      url,
      uploadTime: new Date(),
      messages: message ? [{ text: message }] : [], // ✅ store message properly
    });

    await person.save();
  }

  return NextResponse.json({ message: 'Upload successful' });
}
