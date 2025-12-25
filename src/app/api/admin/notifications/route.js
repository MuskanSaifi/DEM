// app/api/admin/notifications/route.js

import { NextResponse } from 'next/server';
import connectdb from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { Expo } from 'expo-server-sdk';

export async function POST(req) {
  await connectdb();

  const body = await req.json();
  const { title, message } = body;

  if (!title || !message) {
    return NextResponse.json({ success: false, error: 'Title and message required' }, { status: 400 });
  }

  try {
    const notification = await Notification.create({ title, message });

    let expo = new Expo();
    let messages = [];

    // Find all users who have at least one push token
    const usersWithTokens = await User.find({ "pushTokens.0": { "$exists": true } });

    for (let user of usersWithTokens) {
      // Loop through all tokens for this specific user
      for (let token of user.pushTokens) {
        if (!Expo.isExpoPushToken(token)) {
          console.error(`Push token ${token} is not a valid Expo push token`);
          continue;
        }
        messages.push({
          to: token,
          sound: 'default',
          title: title,
          body: message,
          data: {
            screen: 'NotificationsScreen',
            notificationId: notification._id,
          },
        });
      }
    }

    // Send the messages in chunks (Expo recommends this for large lists)
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }
    })();

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    console.error('POST /notifications error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  await connectdb();

  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('GET /notifications error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}