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

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const vendor = await Vendor.create(body);
    return NextResponse.json({ success: true, data: vendor });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, ...body } = await req.json();
    const vendor = await Vendor.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: vendor });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Vendor.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
