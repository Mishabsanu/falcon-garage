import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Vehicle from "@/models/Vehicle";
import JobCard from "@/models/JobCard";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const [customer, vehicles, jobCards, invoices] = await Promise.all([
      Customer.findById(id),
      Vehicle.find({ customerId: id }),
      JobCard.find({ customerId: id }).sort({ createdAt: -1 }),
      Invoice.find({ customerId: id }).sort({ createdAt: -1 }),
    ]);

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        customer,
        vehicles,
        jobCards,
        invoices
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
