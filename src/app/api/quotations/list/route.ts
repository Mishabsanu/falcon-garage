import { connectDB } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const quotations = await Quotation.find()
      .populate("customerId", "name phone")
      .populate("vehicleId", "vehicleNumber model")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Proposals Sync Failure",
    }, { status: 500 });
  }
}
