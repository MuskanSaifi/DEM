// app/api/supportchat/route.js
import { NextResponse } from 'next/server';
import SupportChatBot from '@/models/SupportChatBot';
import connectdb from '@/lib/dbConnect';

export async function POST(req) {
  const { name, issue } = await req.json();

  if (!name || !issue) {
    return NextResponse.json({ success: false, error: "Missing name or issue" }, { status: 400 });
  }

  try {
    await connectdb();
    const newQuery = new SupportChatBot({ name, issue });
    await newQuery.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SupportChatBot save error:", err);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
