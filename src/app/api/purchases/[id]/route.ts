import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json({ success: false, message: "Purchase not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: purchase });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    // Recalculate total amount
    const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.qty * item.costPrice), 0);
    
    const purchase = await Purchase.findByIdAndUpdate(
      id,
      { ...body, totalAmount },
      { new: true }
    );

    if (!purchase) {
      return NextResponse.json({ success: false, message: "Purchase not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: purchase });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Purchase.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
