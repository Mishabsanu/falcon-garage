import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const { invoiceId, amount, method, note, discount } = await req.json();
 
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Billing node not found" }, { status: 404 });
    }
 
    // 1. Update Invoice Discount if provided
    if (discount && discount > 0) {
      invoice.discount = (invoice.discount || 0) + discount;
      // Recalculate Grand Total: (Subtotal + Tax) - New Total Discount
      invoice.grandTotal = (invoice.subtotal + invoice.gstAmount) - invoice.discount;
    }

    // 2. Create Payment Record
    const payment = await Payment.create({
      invoiceId,
      amount,
      method: method || "cash",
      note: note || (discount ? `Rebate of QAR ${discount} applied.` : ""),
      paidAt: new Date()
    });
 
    // 3. Update Invoice Balance
    invoice.paidAmount += amount;
    invoice.balanceAmount = invoice.grandTotal - invoice.paidAmount;
 
    // 4. Update Status
    if (invoice.balanceAmount <= 0) {
      invoice.status = "paid";
      invoice.balanceAmount = 0;
    } else if (invoice.paidAmount > 0) {
      invoice.status = "partial";
    }
 
    await invoice.save();

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Settlement Sync Failure",
    }, { status: 500 });
  }
}
