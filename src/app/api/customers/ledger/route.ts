import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Vehicle from "@/models/Vehicle";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { customerId } = await req.json();

  // fetch invoices
  const invoices = await Invoice.find({ customerId }).sort({ createdAt: -1 });

  // fetch vehicles
  const vehicles = await Vehicle.find({ customerId });

  // fetch payments
  const invoiceIds = invoices.map((i) => i._id);

  const payments = await Payment.find({
    invoiceId: { $in: invoiceIds },
  });

  // totals calculation

  const totalInvoiceAmount = invoices.reduce(
    (sum, inv) => sum + inv.grandTotal,
    0,
  );

  const totalPaidAmount = invoices.reduce(
    (sum, inv) => sum + inv.paidAmount,
    0,
  );

  const totalPendingAmount = invoices.reduce(
    (sum, inv) => sum + inv.balanceAmount,
    0,
  );

  return NextResponse.json({
    success: true,

    summary: {
      totalInvoiceAmount,

      totalPaidAmount,

      totalPendingAmount,
    },

    vehicles,

    invoices,

    payments,
  });
}
