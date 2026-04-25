import { connectDB } from "@/lib/mongodb";
import JobCard from "@/models/JobCard";
import { PDFDocument, rgb, StandardFonts, PDFImage, PDFPage } from "pdf-lib";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const jobCard = await JobCard.findById(id)
      .populate("customerId")
      .populate("vehicleId")
      .populate("technicians");

    if (!jobCard) return new NextResponse("Not Found", { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const colors = {
      slate: rgb(38/255, 50/255, 56/255),      
      amber: rgb(245/255, 158/255, 11/255),    
      gray: rgb(241/255, 245/255, 249/255),    
      textDark: rgb(15/255, 23/255, 42/255),
      textMuted: rgb(100/255, 116/255, 139/255),
      white: rgb(1, 1, 1)
    };

    let logoImage: PDFImage | null = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo-1.png');
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {}

    const drawHeaderAndBars = (page: PDFPage) => {
      const { width, height } = page.getSize();
      page.drawRectangle({ x: 0, y: height - 130, width: width, height: 130, color: colors.slate });
      page.drawRectangle({ x: 0, y: height - 132, width: width, height: 2, color: colors.amber });

      if (logoImage) {
        const logoDims = logoImage.scale(0.22);
        page.drawImage(logoImage, { x: 40, y: height - 105, width: logoDims.width, height: logoDims.height });
      }

      const detailsX = width - 280;
      page.drawText("FALCON PLUS GARAGE W.L.L", { x: detailsX, y: height - 45, size: 14, font: fontBold, color: colors.white });
      page.drawText("Industrial Area, Doha - Qatar", { x: detailsX, y: height - 60, size: 8, font: fontRegular, color: colors.white });
      page.drawText("VAT ID: 300012345600003 | CR No: 210580", { x: detailsX, y: height - 73, size: 8, font: fontRegular, color: colors.white });
      page.drawText("Mob: +974 7072 7121 | Tel: +974 3074 0770", { x: detailsX, y: height - 86, size: 8, font: fontRegular, color: colors.white });
    };

    const drawFooter = (page: PDFPage) => {
      const { width } = page.getSize();
      page.drawRectangle({ x: 0, y: 0, width: width, height: 35, color: colors.slate });
      page.drawRectangle({ x: 0, y: 35, width: width, height: 2, color: colors.amber });
      page.drawText("Job Card - Workshop Production Copy", {
        x: width / 2 - 80, y: 12, size: 8, font: fontItalic, color: colors.white
      });
    };

    const drawTableHeader = (page: PDFPage, y: number) => {
      const { width } = page.getSize();
      page.drawRectangle({ x: 40, y: y - 5, width: width - 80, height: 25, color: colors.slate });
      page.drawRectangle({ x: 40, y: y + 20, width: width - 80, height: 1, color: colors.amber });
      page.drawText("No.", { x: 50, y: y + 6, size: 8, font: fontBold, color: colors.white });
      page.drawText("Service / Parts Description", { x: 80, y: y + 6, size: 8, font: fontBold, color: colors.white });
      page.drawText("Qty.", { x: width - 100, y: y + 6, size: 8, font: fontBold, color: colors.white });
    };

    let page = pdfDoc.addPage([595.28, 841.89]);
    let { width, height } = page.getSize();
    drawHeaderAndBars(page);

    page.drawText("JOB CARD", { x: 40, y: height - 155, size: 18, font: fontBold, color: colors.slate });
    page.drawRectangle({ x: 40, y: height - 160, width: 40, height: 2, color: colors.amber });

    let currentY = height - 190;
    
    // Partitioned Details
    page.drawText("CUSTOMER INFO", { x: 40, y: currentY, size: 7, font: fontBold, color: colors.amber });
    page.drawText(`${jobCard.customerId?.name || 'N/A'}`, { x: 40, y: currentY - 15, size: 10, font: fontBold, color: colors.textDark });
    page.drawText(`Tel: ${jobCard.customerId?.phone || 'N/A'}`, { x: 40, y: currentY - 28, size: 8, font: fontRegular, color: colors.textMuted });

    page.drawLine({ start: { x: width / 2 - 20, y: currentY + 5 }, end: { x: width / 2 - 20, y: currentY - 65 }, thickness: 1.5, color: colors.amber });

    page.drawText("PRODUCTION METRICS", { x: width / 2, y: currentY, size: 7, font: fontBold, color: colors.amber });
    page.drawText(`JC REF: ${jobCard.jobCardNumber}`, { x: width / 2, y: currentY - 15, size: 10, font: fontBold, color: colors.textDark });
    page.drawText(`DATE: ${new Date(jobCard.createdAt).toLocaleDateString('en-GB')}`, { x: width / 2, y: currentY - 28, size: 8, font: fontRegular, color: colors.textMuted });
    page.drawText(`STATUS: ${jobCard.status.toUpperCase()}`, { x: width / 2, y: currentY - 41, size: 8, font: fontBold, color: colors.slate });

    currentY -= 65;
    page.drawRectangle({ x: 40, y: currentY - 10, width: width - 80, height: 30, color: colors.gray });
    page.drawRectangle({ x: 40, y: currentY - 10, width: 2, height: 30, color: colors.amber });
    page.drawText("VEHICLE:", { x: 50, y: currentY + 5, size: 7, font: fontBold, color: colors.textMuted });
    page.drawText(`${jobCard.vehicleId?.brand} ${jobCard.vehicleId?.model} | PLATE: ${jobCard.vehicleId?.vehicleNumber}`, { x: 100, y: currentY + 5, size: 9, font: fontBold, color: colors.slate });

    // Faults
    currentY -= 50;
    page.drawText("DIAGNOSTIC FAULTS / COMPLAINTS:", { x: 40, y: currentY, size: 8, font: fontBold, color: colors.amber });
    currentY -= 15;
    (jobCard.complaints || []).forEach((c: string) => {
      page.drawText(`- ${c}`, { x: 45, y: currentY, size: 8, font: fontRegular, color: colors.textDark });
      currentY -= 12;
    });

    currentY -= 20;
    drawTableHeader(page, currentY);
    let itemY = currentY - 25;
    const items = [...jobCard.items];

    for (let i = 0; i < items.length; i++) {
      if (itemY < 150) {
        drawFooter(page);
        page = pdfDoc.addPage([595.28, 841.89]);
        drawHeaderAndBars(page);
        itemY = height - 160;
        drawTableHeader(page, itemY);
        itemY -= 25;
      }
      const item = items[i];
      if (i % 2 === 0) page.drawRectangle({ x: 40, y: itemY - 5, width: width - 80, height: 20, color: colors.gray });
      page.drawText((i + 1).toString().padStart(2, '0'), { x: 50, y: itemY + 5, size: 8, font: fontRegular });
      page.drawText(item.name, { x: 80, y: itemY + 5, size: 8, font: fontRegular, color: colors.textDark });
      page.drawText(String(item.qty), { x: width - 90, y: itemY + 5, size: 8, font: fontRegular });
      itemY -= 20;
    }

    if (itemY < 150) {
      drawFooter(page);
      page = pdfDoc.addPage([595.28, 841.89]);
      drawHeaderAndBars(page);
      itemY = height - 160;
    }

    page.drawText("ASSIGNED TECHNICIANS:", { x: 40, y: itemY - 20, size: 9, font: fontBold, color: colors.slate });
    const techNames = (jobCard.technicians || []).map((t: any) => t.name).join(" | ");
    page.drawText(techNames || "Deployment Pending", { x: 45, y: itemY - 35, size: 8, font: fontItalic });

    const sigY = 80;
    page.drawLine({ start: { x: 40, y: sigY }, end: { x: 200, y: sigY }, thickness: 1, color: colors.slate });
    page.drawText("Production Supervisor", { x: 65, y: sigY - 12, size: 7, font: fontRegular });
    page.drawLine({ start: { x: width - 200, y: sigY }, end: { x: width - 40, y: sigY }, thickness: 1, color: colors.slate });
    page.drawText("Authorized Signatory", { x: width - 165, y: sigY - 12, size: 7, font: fontRegular });

    drawFooter(page);

    const pdfBytes = await pdfDoc.save();
    return new Response(Buffer.from(pdfBytes), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="JobCard_${jobCard.jobCardNumber}.pdf"` }
    });
  } catch (error: any) {
    console.error("PDF GENERATION ERROR:", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
