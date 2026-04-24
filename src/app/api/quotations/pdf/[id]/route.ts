import { connectDB } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { NextResponse } from "next/server";

type QuotePdfItem = {
  name?: string;
  qty?: number;
  price?: number;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const quotation = await Quotation.findById(id)
      .populate("customerId")
      .populate("vehicleId");

    if (!quotation) return new NextResponse("Not Found", { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("GARAGE ERP - QUOTATION", { x: 50, y: 750, size: 24, font, color: rgb(0.15, 0.2, 0.22) });
    page.drawText(`Quotation #: ${quotation.quotationNumber}`, { x: 50, y: 720, size: 12, font: regularFont });
    page.drawText(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, { x: 50, y: 705, size: 10, font: regularFont });
    page.drawText(`Status: ${quotation.status}`, { x: 420, y: 720, size: 10, font });

    page.drawText("CUSTOMER:", { x: 50, y: 670, size: 10, font });
    page.drawText(`${quotation.customerId?.name || ""}`, { x: 50, y: 655, size: 12, font: regularFont });
    page.drawText(`${quotation.customerId?.phone || ""}`, { x: 50, y: 640, size: 10, font: regularFont });
    page.drawText(`${quotation.customerId?.address || ""}`, { x: 50, y: 625, size: 10, font: regularFont });

    page.drawText("VEHICLE:", { x: 350, y: 670, size: 10, font });
    page.drawText(`Number: ${quotation.vehicleId?.vehicleNumber || ""}`, { x: 350, y: 655, size: 10, font: regularFont });
    page.drawText(`Brand: ${quotation.vehicleId?.brand || ""}`, { x: 350, y: 640, size: 10, font: regularFont });
    page.drawText(`Model: ${quotation.vehicleId?.model || ""}`, { x: 350, y: 625, size: 10, font: regularFont });

    page.drawLine({ start: { x: 50, y: 590 }, end: { x: 550, y: 590 }, thickness: 1, color: rgb(0.82, 0.84, 0.86) });
    page.drawText("Item / Description", { x: 55, y: 575, size: 10, font });
    page.drawText("Qty", { x: 350, y: 575, size: 10, font });
    page.drawText("Price", { x: 420, y: 575, size: 10, font });
    page.drawText("Total", { x: 500, y: 575, size: 10, font });
    page.drawLine({ start: { x: 50, y: 565 }, end: { x: 550, y: 565 }, thickness: 1, color: rgb(0.82, 0.84, 0.86) });

    let y = 545;
    quotation.items.forEach((item: QuotePdfItem) => {
      if (y < 150) return;
      const itemTotal = (item.qty || 0) * (item.price || 0);
      page.drawText((item.name || "Item").slice(0, 42), { x: 55, y, size: 10, font: regularFont });
      page.drawText(String(item.qty || 0), { x: 350, y, size: 10, font: regularFont });
      page.drawText(`Rs.${Number(item.price || 0).toLocaleString()}`, { x: 420, y, size: 10, font: regularFont });
      page.drawText(`Rs.${itemTotal.toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });
      y -= 20;
    });

    if (quotation.laborCost > 0) {
      page.drawText("Labor / Service Charges", { x: 55, y, size: 10, font: regularFont });
      page.drawText(`Rs.${Number(quotation.laborCost || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });
      y -= 30;
    }

    page.drawLine({ start: { x: 350, y }, end: { x: 550, y }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
    y -= 20;
    page.drawText("Subtotal:", { x: 350, y, size: 10, font: regularFont });
    page.drawText(`Rs.${Number(quotation.subtotal || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });

    y -= 20;
    page.drawText(`GST (${quotation.gstPercent || 0}%):`, { x: 350, y, size: 10, font: regularFont });
    page.drawText(`Rs.${Number(quotation.gstAmount || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });

    y -= 20;
    page.drawText("Discount:", { x: 350, y, size: 10, font: regularFont });
    page.drawText(`-Rs.${Number(quotation.discount || 0).toLocaleString()}`, { x: 500, y, size: 10, font: regularFont });

    y -= 30;
    page.drawText("GRAND TOTAL:", { x: 350, y, size: 14, font });
    page.drawText(`Rs.${Number(quotation.grandTotal || 0).toLocaleString()}`, { x: 475, y, size: 14, font, color: rgb(0.96, 0.62, 0.04) });

    page.drawText("This is an estimate. Final invoice may vary after service inspection.", { x: 150, y: 50, size: 8, font: regularFont, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quotation_${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    return new NextResponse(`Internal Error: ${message}`, { status: 500 });
  }
}
