import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find()
      .populate("customerId", "name phone")
      .populate("jobCardId", "jobCardNumber")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Ledger Sync Failure",
    }, { status: 500 });
  }
}
