import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CareerIntelligenceEngine } from '@/lib/intelligence/CareerIntelligenceEngine';
import { SkillFact, ExperienceFact, EducationFact, ProjectFact, CertificationFact } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // ── Auth Guard ──────────────────────────────────────────────────────────
    const session = await auth();
    const authUser = session?.user;
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure a User record exists in our DB (created on first use)
    let dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { id: authUser.id!, email: authUser.email!, name: authUser.name }
      });
    }

    const { text, sourceType = 'TEXT' } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Job description text is required' }, { status: 400 });
    }

    const profile = await CareerIntelligenceEngine.Grounding.getGroundedProfile(dbUser.id);
    const jobData = await CareerIntelligenceEngine.Job.analyze(text, profile);

    // ── Stage 2: Persist the JobTarget ─────────────────────────────────────
    const jobTarget = await prisma.jobTarget.create({
      data: {
        userId: dbUser.id,
        company: jobData.company,
        roleTitle: jobData.roleTitle,
        department: "General",
        industry: "General",
        seniority: "General",
        jobDescription: text,
        sourceType,
        extractedSkills: jobData.extractedSkills,
        extractedReqs: jobData.extractedReqs,
        keywords: jobData.keywords,
      }
    });

    // ── Stage 5: Persist Match Analysis ────────────────────────────────────
    await prisma.jobMatchAnalysis.create({
      data: {
        jobId: jobTarget.id,
        overallScore: jobData.matchAnalysis.overallScore,
        matchedSkills: jobData.matchAnalysis.matchingSkills,
        partialMatches: [],
        missingSkills: jobData.matchAnalysis.missingSkills.map((s: string) => ({ skill: s, criticality: 'HIGH' })),
        resumeRecommendations: jobData.matchAnalysis.recommendations,
        interviewRecommendations: [],
        status: 'COMPLETED',
      }
    });

    return NextResponse.json({ jobId: jobTarget.id });

  } catch (error: any) {
    console.error('[Job Analyze Error]:', error);
    if (error.message === 'AI_PROVIDER_UNAVAILABLE') {
      return NextResponse.json({ error: 'AI features are currently disabled.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to analyze job description' }, { status: 500 });
  }
}
