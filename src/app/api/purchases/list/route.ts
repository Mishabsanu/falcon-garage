import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: purchases });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
