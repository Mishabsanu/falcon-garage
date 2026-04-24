import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

/**
 * REJECT SUB-QUOTATION
 * Handles customer rejection of additional work. Resumes original Job Card work.
 */
export async function POST(req: Request) {
  await connectDB();

  try {
    const { quotationId } = await req.json();

    const subQuote = await Quotation.findById(quotationId);
    if (!subQuote) {
      return NextResponse.json({ success: false, message: "Sub-Quotation not found" }, { status: 404 });
    }

    // 1. Update Sub-Quotation status
    subQuote.status = "rejected";
    await subQuote.save();

    // 2. Return Job Card to IN_PROGRESS so original work can finish
    if (subQuote.jobCardId) {
       await JobCard.findByIdAndUpdate(subQuote.jobCardId, {
         $set: { status: "in_progress" }
       });
    }

    return NextResponse.json({
      success: true,
      message: "Sub-Quotation rejected. Job Card returned to IN_PROGRESS node to finish original tasks.",
      data: subQuote
    });
  } catch (error) {
    console.error("Sub-Quotation rejection failure:", error);
    return NextResponse.json({ success: false, message: "Internal failure" }, { status: 500 });
  }
}
