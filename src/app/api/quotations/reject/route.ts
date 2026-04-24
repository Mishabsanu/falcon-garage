import { connectDB } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

/**
 * REJECT QUOTATION
 * Marks a quotation as rejected by the customer.
 */
export async function POST(req: Request) {
  await connectDB();

  try {
    const { quotationId } = await req.json();

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return NextResponse.json({ success: false, message: "Quotation not found" }, { status: 404 });
    }

    if (quotation.status !== "draft") {
      return NextResponse.json({ success: false, message: "Only draft quotations can be rejected" }, { status: 400 });
    }

    quotation.status = "rejected";
    await quotation.save();

    return NextResponse.json({
      success: true,
      message: "Quotation marked as rejected.",
      data: quotation
    });
  } catch (error) {
    console.error("Quotation rejection failure:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
