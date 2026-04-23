import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";   
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(50);
  
  return NextResponse.json({
    success: true,
    data: notifications,
  });
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
      // Mark all as read
      await Notification.updateMany({ isRead: false }, { isRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (id) {
      await Notification.findByIdAndDelete(id);
    } else {
      // Purge all read notifications
      await Notification.deleteMany({ isRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
