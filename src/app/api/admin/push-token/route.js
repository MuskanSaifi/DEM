// pages/api/admin/push-token.js

import { NextResponse } from 'next/server';
import connectdb from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  await connectdb();

  const { token, userId } = await req.json();

  if (!token || !userId) {
    return NextResponse.json({ success: false, error: 'Token and User ID are required' }, { status: 400 });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if the token already exists in the array
    if (!user.pushTokens.includes(token)) {
      // Add the new token to the pushTokens array
      user.pushTokens.push(token);
      await user.save();
    }

    return NextResponse.json({ success: true, message: 'Push token saved successfully' });
  } catch (error) {
    console.error('POST /push-token error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}