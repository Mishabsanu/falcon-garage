import { connectDB } from "@/lib/mongodb";
import { authMiddleware } from "@/middleware/authMiddleware";
import Invoice from "@/models/Invoice";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import Part from "@/models/Part";
import Notification from "@/models/Notification";
import StockTransaction from "@/models/StockTransaction";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user: any = await authMiddleware();
    await connectDB();

    const { jobCardId } = await req.json();

    // 1. Fetch Job Card and related Quotation
    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) {
      return NextResponse.json({ success: false, message: "Job Card not found" }, { status: 404 });
    }

    // Usually an invoice is generated from the quotation associated with the Job Card
    const quotation = await Quotation.findOne({ _id: { $in: jobCard.quotationIds } });
    if (!quotation) {
      return NextResponse.json({ success: false, message: "Linked Proposal not found" }, { status: 404 });
    }

    const invoiceNumber = await generateNumber("INV");

    // 2. Create Invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      jobCardId: jobCard._id,
      customerId: jobCard.customerId,
      vehicleId: jobCard.vehicleId,
      items: quotation.items,
      laborCost: quotation.laborCost,
      subtotal: quotation.subtotal,
      gstPercent: quotation.gstPercent,
      gstAmount: quotation.gstAmount,
      discount: quotation.discount,
      grandTotal: quotation.grandTotal,
      paidAmount: 0,
      balanceAmount: quotation.grandTotal,
      status: "unpaid"
    });

    // 3. Update Job Card Status
    jobCard.status = "closed";
    await jobCard.save();

    // 4. INVENTORY DEDUCTION (Step 10)
    for (const item of quotation.items) {
      if (item.partId) {
        const part = await Part.findById(item.partId);
        if (part) {
          part.stock -= item.qty;
          await part.save();

          // LOG AUDIT TRAIL
          await StockTransaction.create({
            partId: part._id,
            type: "OUT",
            quantity: item.qty,
            referenceType: "invoice",
            referenceId: invoice.invoiceNumber
          });

          // Trigger LOW_STOCK notification if needed
          if (part.stock <= part.minStock) {
            await Notification.create({
              title: "LOW STOCK ALERT",
              message: `Critical stock level for ${part.name} (${part.stock} units remaining).`,
              type: "LOW_STOCK",
              referenceId: part._id
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Financial Deployment Failure",
    }, { status: 500 });
  }
}
