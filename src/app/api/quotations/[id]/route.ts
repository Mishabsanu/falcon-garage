import { connectDB } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const quotation = await Quotation.findById(id)
      .populate("customerId", "name phone")
      .populate("vehicleId", "vehicleNumber model customerId")
      .lean();

    if (!quotation) {
      return NextResponse.json({
        success: false,
        message: "Quotation not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: getErrorMessage(error, "Quotation load failed"),
    }, { status: 500 });
  }
}
