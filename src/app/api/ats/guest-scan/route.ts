import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { analyzeGuestResume } from '@/lib/ats/guest-engine';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      text = body.text || '';
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size exceeds maximum 5MB limit.' },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
          const parsed = await pdfParse(buffer);
          text = parsed.text;
        } catch (e) {
          return NextResponse.json(
            { error: 'Could not extract text from document. Please ensure your PDF contains selectable text or paste plain text.' },
            { status: 400 }
          );
        }
      }
    }

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        { error: 'Resume text is too short. Please provide at least 30 characters of resume content.' },
        { status: 400 }
      );
    }

    // Run in-memory analysis without database persistence
    const analysis = analyzeGuestResume(text);

    return NextResponse.json({
      success: true,
      analysis,
      requiresAccountToSave: true,
      ctaMessage: 'Create your free Rolevia account to unlock 50+ ATS checks, full recruiter score, and live bullet-by-bullet fixer.'
    });
  } catch (error: any) {
    console.error('[Guest ATS API Error]:', error);
    return NextResponse.json(
      { error: 'Internal error analyzing document.' },
      { status: 500 }
    );
  }
}
