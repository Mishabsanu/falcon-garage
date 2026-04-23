import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import Customer from "@/models/Customer";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const jobCard = await JobCard.findById(id)
      .populate("customerId")
      .populate("vehicleId")
      .populate("technicians")
      .populate("quotationIds");

    if (!jobCard) {
      return NextResponse.json({ success: false, message: "Job card not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: jobCard
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
