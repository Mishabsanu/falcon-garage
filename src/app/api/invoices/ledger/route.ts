
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { invoiceId } = await req.json();

  const invoice = await Invoice.findById(invoiceId);

  const payments = await Payment.find({ invoiceId });

  return NextResponse.json({
    invoice,
    payments,
  });
}
