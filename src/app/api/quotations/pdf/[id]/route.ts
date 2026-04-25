import { connectDB } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
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
    const quotation = await Quotation.findById(id)
      .populate("customerId")
      .populate("vehicleId");

    if (!quotation) return new NextResponse("Not Found", { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const colors = {
      slate: rgb(38/255, 50/255, 56/255),      
      amber: rgb(245/255, 158/255, 11/255),    
      gray: rgb(241/255, 245/255, 249/255),    
      border: rgb(226/255, 232/255, 240/255),  
      textDark: rgb(15/255, 23/255, 42/255),
      textMuted: rgb(100/255, 116/255, 139/255),
      white: rgb(1, 1, 1)
    };

    // Load Logo
    let logoImage: PDFImage | null = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo-1.png');
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {}

    const drawHeaderAndBars = (page: PDFPage) => {
      const { width, height } = page.getSize();
      
      // Professional Header with generous padding
      page.drawRectangle({ x: 0, y: height - 130, width: width, height: 130, color: colors.slate });
      page.drawRectangle({ x: 0, y: height - 132, width: width, height: 2, color: colors.amber });

      if (logoImage) {
        // Reduced Logo Scale and increased Top Padding
        const logoDims = logoImage.scale(0.22); 
        page.drawImage(logoImage, { 
          x: 40, 
          y: height - 105, // Generous padding from the top
          width: logoDims.width, 
          height: logoDims.height 
        });
      }

      const detailsX = width - 280;
      page.drawText("FALCON PLUS GARAGE W.L.L", { x: detailsX, y: height - 45, size: 14, font: fontBold, color: colors.white });
      page.drawText("Industrial Area, Street 24, Doha - Qatar", { x: detailsX, y: height - 60, size: 8, font: fontRegular, color: colors.white });
      page.drawText("VAT ID: 300012345600003 | CR No: 210580", { x: detailsX, y: height - 73, size: 8, font: fontRegular, color: colors.white });
      page.drawText("Mob: +974 7072 7121 | Tel: +974 3074 0770", { x: detailsX, y: height - 86, size: 8, font: fontRegular, color: colors.white });
    };

    const drawFooter = (page: PDFPage) => {
      const { width } = page.getSize();
      page.drawRectangle({ x: 0, y: 0, width: width, height: 35, color: colors.slate });
      page.drawRectangle({ x: 0, y: 35, width: width, height: 2, color: colors.amber });
      page.drawText("Falcon Plus Garage - Precision Engineering & Automotive Care", {
        x: width / 2 - 120, y: 12, size: 8, font: fontItalic, color: colors.white
      });
    };

    const drawTableHeader = (page: PDFPage, y: number) => {
      const { width } = page.getSize();
      const colPos = { sn: 40, desc: 70, qty: 400, rate: 450, amount: 520 };
      page.drawRectangle({ x: 40, y: y - 5, width: width - 80, height: 25, color: colors.slate });
      page.drawRectangle({ x: 40, y: y + 20, width: width - 80, height: 1, color: colors.amber });
      const headers = ["No.", "Particulars / Services", "Qty.", "Rate", "Amount"];
      const hPos = [colPos.sn + 5, colPos.desc + 5, colPos.qty + 5, colPos.rate + 5, colPos.amount + 2];
      headers.forEach((h, i) => {
        page.drawText(h, { x: hPos[i], y: y + 6, size: 8, font: fontBold, color: colors.white });
      });
    };

    let page = pdfDoc.addPage([595.28, 841.89]);
    let { width, height } = page.getSize();
    drawHeaderAndBars(page);

    page.drawText("SERVICE QUOTATION", { x: 40, y: height - 155, size: 18, font: fontBold, color: colors.slate });
    page.drawRectangle({ x: 40, y: height - 160, width: 60, height: 2, color: colors.amber });

    let currentY = height - 190;
    
    // --- PARTITIONED MODAL STYLE DETAILS ---
    page.drawText("CLIENT DETAILS", { x: 40, y: currentY, size: 7, font: fontBold, color: colors.amber });
    page.drawText(`${quotation.customerId?.name || 'N/A'}`, { x: 40, y: currentY - 15, size: 10, font: fontBold, color: colors.textDark });
    page.drawText(`Tel: ${quotation.customerId?.phone || 'N/A'}`, { x: 40, y: currentY - 28, size: 8, font: fontRegular, color: colors.textMuted });

    page.drawLine({ start: { x: width / 2 - 20, y: currentY + 5 }, end: { x: width / 2 - 20, y: currentY - 65 }, thickness: 1.5, color: colors.amber });

    page.drawText("QUOTATION METRICS", { x: width / 2, y: currentY, size: 7, font: fontBold, color: colors.amber });
    page.drawText(`REF: ${quotation.quotationNumber}`, { x: width / 2, y: currentY - 15, size: 10, font: fontBold, color: colors.textDark });
    page.drawText(`DATE: ${new Date(quotation.createdAt).toLocaleDateString('en-GB')}`, { x: width / 2, y: currentY - 28, size: 8, font: fontRegular, color: colors.textMuted });
    page.drawText(`VALID: 07 WORKING DAYS`, { x: width / 2, y: currentY - 41, size: 8, font: fontRegular, color: colors.textMuted });

    currentY -= 65;
    page.drawRectangle({ x: 40, y: currentY - 10, width: width - 80, height: 30, color: colors.gray });
    page.drawRectangle({ x: 40, y: currentY - 10, width: 2, height: 30, color: colors.amber });
    page.drawText("VEHICLE:", { x: 50, y: currentY + 5, size: 7, font: fontBold, color: colors.textMuted });
    page.drawText(`${quotation.vehicleId?.brand} ${quotation.vehicleId?.model} | PLATE: ${quotation.vehicleId?.vehicleNumber}`, { x: 100, y: currentY + 5, size: 9, font: fontBold, color: colors.slate });

    currentY -= 50;
    drawTableHeader(page, currentY);
    
    let itemY = currentY - 25;
    const colPos = { sn: 40, desc: 70, qty: 400, rate: 450, amount: 520 };
    
    const items = [...quotation.items];
    if (quotation.laborCost > 0) items.push({ name: "LABOR & SERVICE CHARGES", qty: 1, price: quotation.laborCost });

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
      page.drawText((i + 1).toString().padStart(2, '0'), { x: colPos.sn + 10, y: itemY + 5, size: 8, font: fontRegular });
      page.drawText(item.name || "", { x: colPos.desc + 5, y: itemY + 5, size: 8, font: item.name.includes("LABOR") ? fontItalic : fontRegular, color: colors.textDark });
      page.drawText(String(item.qty || 0), { x: colPos.qty + 15, y: itemY + 5, size: 8, font: fontRegular });
      page.drawText((item.price || 0).toLocaleString(), { x: colPos.rate + 5, y: itemY + 5, size: 8, font: fontRegular });
      const rowTotal = (item.qty || 0) * (item.price || 0);
      const rowTotalText = rowTotal.toFixed(2);
      page.drawText(rowTotalText, { x: width - 45 - fontBold.widthOfTextAtSize(rowTotalText, 8), y: itemY + 5, size: 8, font: fontBold, color: colors.slate });
      itemY -= 20;
    }

    if (itemY < 220) {
      drawFooter(page);
      page = pdfDoc.addPage([595.28, 841.89]);
      drawHeaderAndBars(page);
      itemY = height - 160;
    }

    const totalsY = itemY;
    page.drawRectangle({ x: width - 200, y: totalsY - 45, width: 160, height: 40, color: colors.gray });
    page.drawRectangle({ x: width - 40, y: totalsY - 45, width: 2, height: 40, color: colors.amber });
    page.drawText("GRAND TOTAL", { x: width - 195, y: totalsY - 18, size: 9, font: fontBold, color: colors.slate });
    const totalText = `QAR ${(quotation.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    page.drawText(totalText, { x: width - 50 - fontBold.widthOfTextAtSize(totalText, 10), y: totalsY - 18, size: 10, font: fontBold, color: colors.textDark });

    const sigY = 80;
    page.drawLine({ start: { x: 40, y: sigY }, end: { x: 200, y: sigY }, thickness: 1, color: colors.slate });
    page.drawText("Customer Acceptance", { x: 65, y: sigY - 12, size: 7, font: fontRegular, color: colors.textMuted });
    page.drawLine({ start: { x: width - 200, y: sigY }, end: { x: width - 40, y: sigY }, thickness: 1, color: colors.slate });
    page.drawText("Authorized Signatory", { x: width - 165, y: sigY - 12, size: 7, font: fontRegular, color: colors.textMuted });

    drawFooter(page);

    const pdfBytes = await pdfDoc.save();
    return new Response(Buffer.from(pdfBytes), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Quotation_${quotation.quotationNumber}.pdf"` }
    });
  } catch (error: any) {
    console.error("PDF GENERATION ERROR:", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
