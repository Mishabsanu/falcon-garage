import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import Part from "@/models/Part";
import { generateNumber } from "@/utils/generateNumber";
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

export async function POST(req: Request) {
  try {
    await connectDB();
    const { vendorName, items } = await req.json();
    
    const purchaseNumber = await generateNumber("PO");
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.qty * item.costPrice), 0);

    const purchase = await Purchase.create({
      purchaseNumber,
      vendorName,
      items,
      totalAmount,
      status: "pending"
    });

    return NextResponse.json({ success: true, data: purchase });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
