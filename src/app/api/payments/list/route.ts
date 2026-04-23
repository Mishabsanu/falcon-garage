import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const payments = await Payment.find()
      .populate("invoiceId", "invoiceNumber")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Transactions Sync Failure",
    }, { status: 500 });
  }
}
