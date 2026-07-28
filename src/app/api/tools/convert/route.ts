import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string; // 'docx' or 'pdf'

    if (!file || !targetFormat) {
      return NextResponse.json({ error: 'File and targetFormat are required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    // 1. EXTRACT TEXT
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      // Just assume it's plain text if unknown
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      extractedText = "No extractable text found in document.";
    }

    // 2. GENERATE TARGET FORMAT
    if (targetFormat === 'docx') {
      // Generate Word Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: extractedText.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line)],
            })
          ),
        }],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      
      return new NextResponse(docxBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="converted_${file.name.replace(/\.[^/.]+$/, "")}.docx"`
        }
      });

    } else if (targetFormat === 'pdf') {
      // Generate PDF Document
      return new Promise<NextResponse>((resolve, reject) => {
        try {
          const pdfDoc = new PDFDocument({ margin: 50 });
          const chunks: Uint8Array[] = [];

          pdfDoc.on('data', chunk => chunks.push(chunk));
          pdfDoc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            resolve(new NextResponse(pdfBuffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="converted_${file.name.replace(/\.[^/.]+$/, "")}.pdf"`
              }
            }));
          });

          // Write text with basic formatting
          pdfDoc.fontSize(12).font('Helvetica').text(extractedText, {
            align: 'left',
            lineGap: 2
          });

          pdfDoc.end();
        } catch (err) {
          reject(err);
        }
      });
    }

    return NextResponse.json({ error: 'Invalid target format' }, { status: 400 });

  } catch (error: any) {
    console.error('File Conversion Error:', error);
    return NextResponse.json({ error: 'Failed to convert file', details: error.message }, { status: 500 });
  }
}
