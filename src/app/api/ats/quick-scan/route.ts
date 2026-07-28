import { NextResponse } from 'next/server';
import { isAiAvailable, extractEntities } from '@/lib/ai/gateway';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const AtsQuickScanSchema = z.object({
  overallScore: z.number().describe('Overall ATS score 0-100'),
  parseRate: z.number().describe('ATS parse rate 0-100: how well an ATS can read this resume'),
  contentScore: z.number().describe('Content quality score 0-100'),
  sectionsScore: z.number().describe('Sections completeness score 0-100: presence of key sections'),
  formattingScore: z.number().describe('Formatting/ATS-essentials score 0-100'),
  issues: z.array(z.object({
    category: z.enum(['CONTENT', 'SECTIONS', 'ATS_ESSENTIALS']),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']),
    title: z.string(),
    description: z.string(),
    fix: z.string().describe('Exact fix the candidate must apply')
  })).describe('All actionable issues found in the resume. Maximum 8.'),
  strengths: z.array(z.string()).describe('3-5 strong positive aspects of the resume'),
  summary: z.string().describe('One concise paragraph summary of the resume quality')
});

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
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else if (fileName.endsWith('.txt')) {
      resumeText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT.' }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract enough text from your resume. Make sure it is not a scanned image.' }, { status: 400 });
    }

    if (!isAiAvailable()) {
      return NextResponse.json({ error: 'AI Engine is currently offline.' }, { status: 503 });
    }

    const prompt = `
You are an elite ATS (Applicant Tracking System) evaluator and Senior Resume Expert.
Analyze the following resume text thoroughly and score it across multiple dimensions.

RESUME TEXT:
"""
${resumeText.substring(0, 12000)}
"""

Evaluation Criteria:
1. **Parse Rate (0-100)**: Can an ATS robot parse this? Penalise: tables, images, headers/footers, unusual fonts, graphics, missing contact info.
2. **Content Score (0-100)**: Are bullets quantified? Strong action verbs? Impactful achievements? Not just job duties?
3. **Sections Score (0-100)**: Does it have all key sections: Contact Info, Summary/Objective, Work Experience, Education, Skills? 
4. **Formatting/ATS Essentials Score (0-100)**: Standard date formats, consistent formatting, no spelling errors, no keywords stuffing?
5. **Overall Score (0-100)**: Weighted composite of all above.

Be harsh but fair. Real ATS systems are unforgiving. The issues must be specific and actionable.
`;

    const result = await extractEntities(prompt, AtsQuickScanSchema, {
      systemPrompt: 'You are an elite Resume ATS Evaluator AI. Output accurate, honest JSON conforming to the schema. Never inflate scores. Be specific about issues.'
    });

    return NextResponse.json({ result });

  } catch (err: any) {
    console.error('[ATS Quick Scan]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
