import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isAiAvailable, extractEntities } from '@/lib/ai/gateway';
import { z } from 'zod';

const ATSAnalysisSchema = z.object({
  score: z.number().describe('Overall ATS Match Score from 0 to 100'),
  breakdown: z.object({
    hardSkillsMatch: z.number().describe('Score out of 100 for hard skills matching'),
    actionVerbsMatch: z.number().describe('Score out of 100 for action verbs impact'),
    atsReadability: z.number().describe('Score out of 100 for ATS parsing readability')
  }),
  actionableChanges: z.array(z.object({
    type: z.string(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    title: z.string(),
    description: z.string(),
    action: z.string()
  })).describe('List of exact, actionable changes the candidate must make to pass the ATS'),
  tailoredResume: z.string().describe('A complete, fully tailored plain text resume (Name, Contact, Summary, Experience, Skills, Education) that perfectly aligns with the job description.')
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobDescription } = await req.json();
    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        careerProfile: {
          include: { basics: true, skills: true, experiences: true, projects: true, educations: true }
        }, 
        resumes: {
          select: { id: true, title: true, content: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = user.careerProfile;
    const masterProfileText = [
      profile?.basics?.name || user.name || '',
      profile?.basics?.summary || '',
      ...(profile?.skills || []).map((s: any) => s.name),
      ...(profile?.experiences || []).map((e: any) => `${e.role} ${e.company} ${e.description} ${(e.bullets || []).join(' ')}`),
      ...(profile?.projects || []).map((p: any) => `${p.name} ${p.description} ${(p.bullets || []).join(' ')}`),
      ...(user.resumes || []).map((r: any) => r.content ? JSON.stringify(r.content) : '')
    ].join(' ').trim();

    if (!isAiAvailable()) {
      return NextResponse.json({ error: 'AI Gateway is currently offline. Please configure your Ollama or OpenAI keys.' }, { status: 503 });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) algorithm and a Senior Executive Resume Writer. 
Your task is to analyze a candidate's Master Profile against a Job Description.

Job Description:
"""
${jobDescription}
"""

Candidate Master Profile Database:
"""
${masterProfileText}
"""

Instructions:
1. Calculate a strict, highly accurate ATS Match score (0-100). Be ruthless; if they lack required skills, score them low.
2. Provide a breakdown for Hard Skills, Action Verbs, and Readability.
3. Generate specific, actionable instructions for exactly what they must add or change in their resume.
4. Finally, write a completely new, flawless 'Tailored Resume' based on their Master Profile that maximizes their ATS score for this specific job. Use strong action verbs and metrics.
`;

    const aiResult = await extractEntities(prompt, ATSAnalysisSchema, {
      systemPrompt: 'You are an elite, highly accurate ATS Resume parsing AI. Always output valid JSON conforming to the requested schema.'
    });

    return NextResponse.json({
      score: aiResult.score,
      breakdown: aiResult.breakdown,
      actionableChanges: aiResult.actionableChanges,
      tailoredResume: aiResult.tailoredResume
    });

  } catch (error: any) {
    console.error('ATS Analysis AI Error:', error);
    return NextResponse.json({ error: 'AI Analysis Failed: ' + error.message }, { status: 500 });
  }
}
