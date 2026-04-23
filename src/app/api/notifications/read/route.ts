import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { notificationId } = await req.json();

  await Notification.findByIdAndUpdate(notificationId, { isRead: true });

  return NextResponse.json({
    success: true,
  });
}
