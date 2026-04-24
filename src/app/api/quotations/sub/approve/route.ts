import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

/**
 * APPROVE SUB-QUOTATION
 * Syncs additional work items into the parent Job Card's active execution list.
 */
export async function POST(req: Request) {
  await connectDB();

  try {
    const { quotationId } = await req.json();

    const subQuote = await Quotation.findById(quotationId);
    if (!subQuote) {
      return NextResponse.json({ success: false, message: "Sub-Quotation not found" }, { status: 404 });
    }

    if (!subQuote.isSubQuotation) {
      return NextResponse.json({ success: false, message: "This is not a sub-quotation node" }, { status: 400 });
    }

    // 1. Update Sub-Quotation status
    subQuote.status = "approved";
    await subQuote.save();

    // 2. Sync with Job Card and return status to IN_PROGRESS
    if (subQuote.jobCardId) {
       await JobCard.findByIdAndUpdate(subQuote.jobCardId, {
         $addToSet: { quotationIds: subQuote._id },
         $set: { status: "in_progress" }
       });
    }

    return NextResponse.json({
      success: true,
      message: "Sub-Quotation approved. Job Card resumed to IN_PROGRESS node.",
      data: subQuote
    });
  } catch (error) {
    console.error("Sub-Quotation sync failure:", error);
    return NextResponse.json({ success: false, message: "Internal sync failure" }, { status: 500 });
  }
}
