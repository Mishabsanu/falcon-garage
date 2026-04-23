import { connectDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const vendors = await Vendor.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: vendors });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
