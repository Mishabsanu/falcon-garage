import { connectDB } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import Invoice from "@/models/Invoice";
import { generateNumber } from "@/utils/generateNumber";
import { NextResponse } from "next/server";

/**
 * GENERATE INSPECTION CHARGE INVOICE
 * Used when a customer rejects a quotation, but the workshop needs to bill for the inspection time.
 */
export async function POST(req: Request) {
  await connectDB();

  try {
    const { quotationId, amount } = await req.json();

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return NextResponse.json({ success: false, message: "Quotation not found" }, { status: 404 });
    }

    if (quotation.status !== "rejected") {
      return NextResponse.json({ success: false, message: "Only rejected quotations can generate inspection invoices" }, { status: 400 });
    }

    const invoiceNumber = await generateNumber("INV");
    
    // Create a simplified invoice for inspection charges
    const invoice = await Invoice.create({
      invoiceNumber,
      customerId: quotation.customerId,
      vehicleId: quotation.vehicleId,
      items: [
        {
          name: "Vehicle Inspection & Diagnostics Fee",
          qty: 1,
          price: Number(amount) || 250, // Default fee if not provided
          total: Number(amount) || 250,
        }
      ],
      laborCost: 0,
      subtotal: Number(amount) || 250,
      gstPercent: 18,
      gstAmount: (Number(amount) || 250) * 0.18,
      discount: 0,
      grandTotal: (Number(amount) || 250) * 1.18,
      balanceAmount: (Number(amount) || 250) * 1.18,
      status: "unpaid",
      notes: `Generated from rejected quotation ${quotation.quotationNumber}`
    });

    // Update quotation status to track that it was billed for inspection
    await Quotation.findByIdAndUpdate(quotationId, { 
      status: "billed_inspection",
      linkedInvoiceId: invoice._id 
    }, { runValidators: false });

    return NextResponse.json({
      success: true,
      data: invoice,
      message: "Inspection invoice generated successfully"
    });
  } catch (error) {
    console.error("Inspection billing failure:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
