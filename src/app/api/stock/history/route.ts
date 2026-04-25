import { connectDB } from "@/lib/mongodb";
import StockTransaction from "@/models/StockTransaction";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get("referenceId");
    
    const query = referenceId ? { referenceId } : {};
    
    const transactions = await StockTransaction.find(query)
      .populate("partId", "name sku")
      .sort({ createdAt: -1 })
      .limit(100);
      
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
