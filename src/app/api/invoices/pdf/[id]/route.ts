import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const invoice = await Invoice.findById(id)
      .populate("customerId")
      .populate("vehicleId");

    if (!invoice) return new NextResponse("Not Found", { status: 404 });

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawText("GARAGE ERP - TAX INVOICE", { x: 50, y: 750, size: 24, font, color: rgb(0.02, 0.35, 0.39) });
    page.drawText(`Invoice #: ${invoice.invoiceNumber}`, { x: 50, y: 720, size: 12, font: regularFont });
    page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { x: 50, y: 705, size: 10, font: regularFont });

    // Customer & Vehicle Info
    page.drawText("BILL TO:", { x: 50, y: 670, size: 10, font });
    page.drawText(`${invoice.customerId?.name}`, { x: 50, y: 655, size: 12, font: regularFont });
    page.drawText(`${invoice.customerId?.phone}`, { x: 50, y: 640, size: 10, font: regularFont });
    page.drawText(`${invoice.customerId?.address}`, { x: 50, y: 625, size: 10, font: regularFont });

    page.drawText("VEHICLE DETAILS:", { x: 350, y: 670, size: 10, font });
    page.drawText(`Number: ${invoice.vehicleId?.vehicleNumber}`, { x: 350, y: 655, size: 10, font: regularFont });
    page.drawText(`Brand: ${invoice.vehicleId?.brand}`, { x: 350, y: 640, size: 10, font: regularFont });
    page.drawText(`Model: ${invoice.vehicleId?.model}`, { x: 350, y: 625, size: 10, font: regularFont });

    // Table Header
    page.drawLine({ start: { x: 50, y: 590 }, end: { x: 550, y: 590 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    page.drawText("Item / Description", { x: 55, y: 575, size: 10, font });
    page.drawText("Qty", { x: 350, y: 575, size: 10, font });
    page.drawText("Price", { x: 420, y: 575, size: 10, font });
    page.drawText("Total", { x: 500, y: 575, size: 10, font });
    page.drawLine({ start: { x: 50, y: 565 }, end: { x: 550, y: 565 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

    // Items
    let y = 545;
    invoice.items.forEach((item: any) => {
      page.drawText(item.name || "Unknown Item", { x: 55, y, size: 10, font: regularFont });
      page.drawText((item.qty || 0).toString(), { x: 350, y, size: 10, font: regularFont });
      page.drawText(`Rs.${(item.price || 0).toLocaleString()}`, { x: 420, y, size: 10, font: regularFont });
      
      const itemTotal = item.total || ((item.qty || 0) * (item.price || 0));
      page.drawText(`Rs.${itemTotal.toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });
      y -= 20;
    });

    // Labor
    if (invoice.laborCost > 0) {
      page.drawText("Labor/Service Charges", { x: 55, y, size: 10, font: regularFont });
      page.drawText(`Rs.${invoice.laborCost.toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });
      y -= 30;
    }

    // Totals
    page.drawLine({ start: { x: 350, y }, end: { x: 550, y }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
    y -= 20;
    page.drawText("Subtotal:", { x: 350, y, size: 10, font: regularFont });
    page.drawText(`Rs.${(invoice.subtotal || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });
    
    y -= 20;
    page.drawText(`GST (${invoice.gstPercent || 0}%):`, { x: 350, y, size: 10, font: regularFont });
    page.drawText(`Rs.${(invoice.gstAmount || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });

    y -= 20;
    page.drawText(`Discount:`, { x: 350, y, size: 10, font: regularFont });
    page.drawText(`-Rs.${(invoice.discount || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });

    y -= 30;
    page.drawText("GRAND TOTAL:", { x: 350, y, size: 14, font });
    page.drawText(`Rs.${(invoice.grandTotal || 0).toLocaleString()}`, { x: 480, y, size: 14, font, color: rgb(0.1, 0.8, 0.5) });

    // Footer
    page.drawText("Thank you for choosing GARAGE for your vehicle care.", { x: 180, y: 50, size: 8, font: regularFont, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF GENERATION ERROR:", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
