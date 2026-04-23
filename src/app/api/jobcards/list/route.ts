import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const jobCards = await JobCard.find()
      .populate("customerId", "name phone")
      .populate("vehicleId", "vehicleNumber model")
      .populate("technicians", "name")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: jobCards,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Queue Sync Failure",
    }, { status: 500 });
  }
}
