import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    // Populate customerId to get the owner's name
    const vehicles = await Vehicle.find()
      .populate("customerId", "name")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Registry Sync Failure",
    }, { status: 500 });
  }
}
