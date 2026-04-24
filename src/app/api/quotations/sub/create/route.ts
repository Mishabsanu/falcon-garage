import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const quotationNumber = await generateNumber("QT");

  const subQuotation = await Quotation.create({
    quotationNumber,
    customerId: body.customerId,
    vehicleId: body.vehicleId,
    jobCardId: body.jobCardId,
    items: body.items,
    isSubQuotation: true,
  });

  await JobCard.findByIdAndUpdate(body.jobCardId, {
    $push: { quotationIds: subQuotation._id },
    $set: { status: "waiting_approval" }
  });

  return NextResponse.json({
    success: true,
    data: subQuotation,
    message: "Sub-Quotation generated. Job Card moved to WAITING_APPROVAL state."
  });
}
