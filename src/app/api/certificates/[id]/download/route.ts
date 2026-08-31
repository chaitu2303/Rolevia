import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cert = await prisma.certificate.findUnique({
      where: { certificateCode: id },
      include: {
        user: { select: { name: true } }
      }
    });

    if (!cert) {
      return new NextResponse('Certificate not found', { status: 404 });
    }

    if (cert.status === 'REVOKED') {
      return new NextResponse('Certificate has been revoked', { status: 403 });
    }

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    
    // Add a blank page to the document
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    
    const { width, height } = page.getSize();
    
    // Get fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Draw Border
    page.drawRectangle({
      x: 30, y: 30, width: width - 60, height: height - 60,
      borderColor: rgb(0, 0, 0),
      borderWidth: 5,
    });
    
    // Draw Title
    page.drawText('Rolevia Certificate of Achievement', {
      x: width / 2 - 250,
      y: height - 120,
      size: 30,
      font: timesRomanBoldFont,
      color: rgb(0.1, 0.1, 0.4),
    });
    
    // Draw Subtitle
    page.drawText('This is to certify that', {
      x: width / 2 - 80,
      y: height - 180,
      size: 18,
      font: timesRomanFont,
    });
    
    // Draw Name
    const recipientName = cert.user.name || 'Rolevia Member';
    page.drawText(recipientName, {
      x: width / 2 - (recipientName.length * 9),
      y: height - 230,
      size: 36,
      font: timesRomanBoldFont,
    });
    
    // Draw Achievement Title
    page.drawText(`has successfully achieved: ${cert.title}`, {
      x: width / 2 - 200,
      y: height - 280,
      size: 20,
      font: helveticaFont,
    });
    
    // Draw Issue Date
    page.drawText(`Issue Date: ${new Date(cert.issuedAt).toLocaleDateString()}`, {
      x: 80,
      y: 120,
      size: 14,
      font: helveticaFont,
    });
    
    // Draw Credential ID
    page.drawText(`Credential ID: ${cert.certificateCode}`, {
      x: 80,
      y: 100,
      size: 14,
      font: helveticaFont,
    });

    // Generate QR Code
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/certificate/${cert.certificateCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 150
    });
    
    // Embed QR Code
    const qrImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    page.drawImage(qrImage, {
      x: width - 200,
      y: 80,
      width: 100,
      height: 100,
    });
    
    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cert.certificateCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
