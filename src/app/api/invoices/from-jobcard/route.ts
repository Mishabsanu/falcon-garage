import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import Quotation from "@/models/Quotation";
import Invoice from "@/models/Invoice";
import { generateNumber } from "@/utils/generateNumber";
import { calculateInvoiceTotals } from "@/utils/invoiceCalculator";
import { NextResponse } from "next/server";
import Part from "@/models/Part";
import StockTransaction from "@/models/StockTransaction";
import { createNotification } from "@/utils/createNotification";

export async function POST(req: Request) {
  await connectDB();

  const { jobCardId, laborCost, discount } = await req.json();

  const jobCard = await JobCard.findById(jobCardId).populate("quotationIds");
  if (!jobCard) {
    return NextResponse.json({ success: false, message: "Job card not found" }, { status: 404 });
  }

  // 1. Gather all items from Job Card and all linked quotations
  let items: any[] = [...(jobCard.items || [])];
  for (const quoteId of jobCard.quotationIds) {
    const fullQuotation = await Quotation.findById(quoteId);
    if (fullQuotation && fullQuotation.items) {
      items.push(...fullQuotation.items);
    }
  }

  // 2. Deduct stock and record transactions
  for (const item of items) {
    // Try to find part by ID or name
    const part = item.partId ? await Part.findById(item.partId) : await Part.findOne({ name: item.name });
    
    if (part) {
      part.stock -= item.qty;
      await part.save();

      await StockTransaction.create({
        partId: part._id,
        type: "OUT",
        quantity: item.qty,
        referenceType: "invoice",
        referenceId: jobCard._id.toString(),
      });

      // Check for low stock notification
      if (part.stock <= part.minStock) {
        await createNotification({
          title: "Low Stock Alert",
          message: `${part.name} stock is low (${part.stock} remaining)`,
          type: "LOW_STOCK",
          referenceId: part._id,
        });
      }
    }
  }

  // 3. Calculate totals and create invoice
  const totals = calculateInvoiceTotals(items, Number(laborCost), 18, Number(discount));
  const invoiceNumber = await generateNumber("INV");

  const invoice = await Invoice.create({
    invoiceNumber,
    lpoNumber: jobCard.lpoNumber,
    jobCardId: jobCard._id,
    customerId: jobCard.customerId,
    vehicleId: jobCard.vehicleId,
    items: items.map((item: any) => ({
      partId: item.partId,
      name: item.name,
      qty: item.qty,
      price: item.price,
      total: item.qty * item.price,
    })),
    laborCost: Number(laborCost),
    subtotal: totals.subtotal,
    gstPercent: 18,
    gstAmount: totals.gstAmount,
    discount: Number(discount),
    grandTotal: totals.grandTotal,
    balanceAmount: totals.grandTotal,
    status: "unpaid",
  });

  // 4. Update Job Card status
  jobCard.status = "closed";
  jobCard.endTime = new Date();
  await jobCard.save();

  return NextResponse.json({
    success: true,
    data: invoice,
  });
}
