import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const { quotationId } = await req.json();

    // Fetch the quotation to copy data
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });
    }

    const jobCardNumber = await generateNumber("JOB");

    // Copy items, customer, vehicle from quotation
    const jobCard = await JobCard.create({
      jobCardNumber,
      customerId: quotation.customerId,
      vehicleId: quotation.vehicleId,
      quotationIds: [quotationId],
      items: quotation.items,
      status: "open"
    });

    // Mark quotation as converted
    quotation.status = "converted";
    await quotation.save();

    return NextResponse.json({
      success: true,
      data: jobCard,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Queue Deployment Failure",
    }, { status: 500 });
  }
}
