import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Quotation from "@/models/Quotation";
import JobCard from "@/models/JobCard";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const body = await req.json();
    const quotationNumber = await generateNumber("QTN");

    const quotation = await Quotation.create({
      ...body,
      quotationNumber,
      status: "draft"
    });

    // Link back to Job Card if provided
    if (body.jobCardId) {
      await JobCard.findByIdAndUpdate(body.jobCardId, {
        $push: { quotationIds: quotation._id }
      });
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Proposal Draft Failure",
    }, { status: 500 });
  }
}
