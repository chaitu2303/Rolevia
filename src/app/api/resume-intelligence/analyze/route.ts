/**
 * POST /api/resume-intelligence/analyze
 *
 * Accepts: multipart/form-data OR JSON
 * - file (PDF | DOCX) OR text (plain text)
 * - jobDescription?: string
 * - targetRole?: string
 * - targetCompany?: string
 * - experienceLevel?: STUDENT | FRESHER | ENTRY | MID | SENIOR | LEAD | MANAGER | EXECUTIVE
 * - country?: string
 * - resumeId?: string  (optional link to a Resume Studio record)
 *
 * Returns: { reportId, report }
 * Does NOT store raw resume text in response — only evidence snippets.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { runResumeIntelligence } from '@/lib/intelligence/IntelligenceOrchestrator';
import type { CareerLevel } from '@/lib/intelligence/CareerLevelAdapter';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
// 10MB limit for resume files
export const maxDuration = 60;

async function extractTextFromFile(file: File): Promise<{ text: string; mimeType: string }> {
  const mimeType = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
    // Dynamic import to avoid edge runtime issues
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return { text: data.text ?? '', mimeType: 'application/pdf' };
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value ?? '',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  if (mimeType === 'text/plain' || file.name.endsWith('.txt')) {
    return { text: buffer.toString('utf-8'), mimeType: 'text/plain' };
  }

  throw new Error(`Unsupported file type: ${mimeType || file.name}. Please upload PDF or DOCX.`);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const authUser = session?.user;
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') ?? '';

    let text = '';
    let fileName = 'unknown.pdf';
    let fileMimeType = 'application/pdf';
    let fileSizeBytes = 0;
    let jobDescriptionText: string | null = null;
    let targetRole: string | null = null;
    let targetCompany: string | null = null;
    let experienceLevel: CareerLevel | null = null;
    let resumeId: string | null = null;
    let country: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      const file = formData.get('file') as File | null;
      jobDescriptionText = formData.get('jobDescription') as string | null;
      targetRole = formData.get('targetRole') as string | null;
      targetCompany = formData.get('targetCompany') as string | null;
      experienceLevel = formData.get('experienceLevel') as CareerLevel | null;
      resumeId = formData.get('resumeId') as string | null;
      country = formData.get('country') as string | null;

      if (!file) {
        // Check for plain text fallback
        const rawText = formData.get('text') as string | null;
        if (!rawText) {
          return NextResponse.json({ error: 'No file or text provided.' }, { status: 400 });
        }
        text = rawText;
        fileName = 'pasted-text.txt';
        fileMimeType = 'text/plain';
        fileSizeBytes = Buffer.byteLength(rawText, 'utf-8');
      } else {
        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        fileName = file.name;
        fileSizeBytes = file.size;

        try {
          const extracted = await extractTextFromFile(file);
          text = extracted.text;
          fileMimeType = extracted.mimeType;
        } catch (extractErr: any) {
          return NextResponse.json({ error: extractErr.message }, { status: 422 });
        }
      }
    } else {
      // JSON body (text submission)
      const body = await req.json();
      text = body.text ?? '';
      fileName = body.fileName ?? 'pasted-text.txt';
      fileMimeType = 'text/plain';
      fileSizeBytes = Buffer.byteLength(text, 'utf-8');
      jobDescriptionText = body.jobDescription ?? null;
      targetRole = body.targetRole ?? null;
      targetCompany = body.targetCompany ?? null;
      experienceLevel = body.experienceLevel ?? null;
      resumeId = body.resumeId ?? null;
      country = body.country ?? null;
    }

    // Validate ownership of linked resume
    if (resumeId) {
      const linkedResume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: dbUser.id },
        select: { id: true },
      });
      if (!linkedResume) {
        resumeId = null; // Silently unlink if not owned — don't fail
      }
    }

    // ── Document Fingerprinting & Duplicate Detection ──────────────────────
    const textHash = crypto.createHash('sha256').update(text).digest('hex');

    // Check if we already analyzed this exact text for this user
    const existingReport = await prisma.resumeIntelligenceReport.findFirst({
      where: {
        userId: dbUser.id,
        resumeHash: textHash,
        targetRole,
        // Optional: Check jobDescriptionHash too for strict match
      },
      orderBy: { createdAt: 'desc' } as any
    });

    if (existingReport) {
      // Fetch full report to return without consuming credits
      const safeSections = (existingReport.parsedSections as any) || [];
      return NextResponse.json({
        reportId: existingReport.id,
        report: {
          ...existingReport,
          parsedSections: safeSections,
        },
        message: 'Duplicate upload detected. Returning existing analysis.',
        isDuplicate: true
      });
    }

    // ── Run intelligence pipeline ──────────────────────────────────────────
    const report = await runResumeIntelligence({
      text,
      fileName,
      fileMimeType,
      fileSizeBytes,
      jobDescriptionText,
      targetRole,
      targetCompany,
      experienceLevel,
      country,
    });

    // ── Persist report ─────────────────────────────────────────────────────
    const jdHash = jobDescriptionText
      ? crypto.createHash('sha256').update(jobDescriptionText).digest('hex').slice(0, 16)
      : null;

    const savedReport = await prisma.resumeIntelligenceReport.create({
      data: {
        userId: dbUser.id,
        resumeId: resumeId ?? undefined,
        fileName,
        fileMimeType,
        fileSizeBytes,
        resumeHash: textHash,
        extractionStatus: report.extractionStatus,
        extractionConfidence: report.extractionConfidence,
        targetRole,
        targetCompany,
        experienceLevel,
        country,
        hasJobDescription: report.hasJobDescription,
        jobDescriptionHash: jdHash,
        careerOsScore: report.careerOsScore,
        atsScore: report.atsScore,
        contentScore: report.contentScore,
        impactScore: report.impactScore,
        jobMatchScore: report.jobMatchScore,
        recruiterScore: report.recruiterScore,
        consistencyScore: report.consistencyScore,
        dimensionBreakdown: {
          ats: { score: report.atsScore, summary: report.atsResult.summary },
          content: { score: report.contentScore, summary: report.contentResult.summary },
          impact: { score: report.impactScore, summary: report.impactResult.summary },
          jobMatch: report.jobMatchResult ? { score: report.jobMatchScore, summary: report.jobMatchResult.summary } : null,
          recruiter: { score: report.recruiterScore, summary: report.recruiterResult.summary },
          consistency: { score: report.consistencyScore },
        },
        parsedSections: report.parsedSections as any,
        checks: [
          ...report.atsResult.checks,
          ...report.contentResult.checks,
          ...report.impactResult.checks,
        ] as any,
        keywordMatches: (report.keywordResult?.keywordMatches ?? []) as any,
        jobMatchDetail: (report.jobMatchResult?.dimensions ?? []) as any,
        recruiterSignals: report.recruiterResult.signals as any,
        biasPrivacyFlags: report.privacyResult.flags as any,
        actionPlan: report.actionPlan.items as any,
        reportVersion: report.reportVersion,
      },
    });

    // Persist bullet analyses
    const allBullets = report.impactResult.bulletAnalyses;
    if (allBullets.length > 0) {
      await prisma.bulletAnalysisRecord.createMany({
        data: allBullets.map((b, idx) => ({
          reportId: savedReport.id,
          sectionType: 'experience',
          bulletIndex: idx,
          originalText: b.originalText,
          impactScore: b.impactScore,
          clarityScore: b.clarityScore,
          specificityScore: b.specificityScore,
          actionStrength: b.actionStrength,
          quantificationScore: b.quantificationScore,
          overallScore: b.overallScore,
          issues: b.issues as any,
          suggestions: b.suggestions as any,
          hasQuantification: b.hasQuantification,
          weakVerb: b.weakVerb ?? undefined,
          suggestedVerb: b.suggestedVerb ?? undefined,
        })),
      });
    }

    // ── Return report (no raw text in response) ────────────────────────────
    // Strip rawText from parsedSections before returning
    const { parsedSections, ...safeReport } = report;
    const safeSections = parsedSections.map(({ type, rawHeading, bullets, confidence }) => ({
      type, rawHeading, bullets, confidence,
    }));

    return NextResponse.json({
      reportId: savedReport.id,
      report: {
        ...safeReport,
        parsedSections: safeSections,
      },
    });
  } catch (err: any) {
    console.error('[POST /api/resume-intelligence/analyze]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
