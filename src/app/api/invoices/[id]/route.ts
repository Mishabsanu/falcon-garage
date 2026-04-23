import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Vehicle from "@/models/Vehicle";
import JobCard from "@/models/JobCard";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const invoice = await Invoice.findById(id)
      .populate("customerId")
      .populate("vehicleId")
      .populate("jobCardId");

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: invoice
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
