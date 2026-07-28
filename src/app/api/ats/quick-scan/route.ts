import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeResume } from '@/lib/ats/RuleBasedAtsEngine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = '';

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf')) {
      try {
        const data = await pdfParse(buffer);
        resumeText = data.text;
      } catch {
        return NextResponse.json({ error: 'Could not parse PDF. Make sure it is not a scanned image or password-protected.' }, { status: 400 });
      }
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else if (fileName.endsWith('.txt')) {
      resumeText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract enough text. Make sure your resume is not a scanned image.' }, { status: 400 });
    }

    // Always use the rule-based engine — no API required, no costs, instant results
    const result = analyzeResume(resumeText);

    return NextResponse.json({ result });

  } catch (err: any) {
    console.error('[ATS Quick Scan]', err);
    return NextResponse.json({ error: 'Failed to analyze resume. Please try again.' }, { status: 500 });
  }
}
