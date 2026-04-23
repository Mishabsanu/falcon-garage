import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Access Denied: Node Synchronization Failure",
    }, { status: 500 });
  }
}
