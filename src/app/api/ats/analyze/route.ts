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

    // 1. Calculate deterministic, accurate, non-fluctuating score
    const { matchJobDescription } = await import('@/lib/ats/RuleBasedJdMatcher');
    const result = matchJobDescription(masterProfileText, jobDescription);

    // 2. Try to generate a tailored resume with AI if available (for the text generation only)
    let tailoredResume = '';
    
    if (isAiAvailable()) {
      try {
        const prompt = `
You are an expert ATS (Applicant Tracking System) algorithm and a Senior Executive Resume Writer. 
Your task is to write a completely new, flawless 'Tailored Resume' based on the candidate's Master Profile that maximizes their ATS score for this specific Job Description.

Job Description:
"""
${jobDescription}
"""

Candidate Master Profile Database:
"""
${masterProfileText}
"""

Instructions:
1. Write a plain text resume (Name, Contact, Summary, Experience, Skills, Education).
2. Perfectly align it with the job description.
3. Integrate the missing keywords naturally into the experience bullets.
4. Output ONLY the resume text, nothing else. No markdown, no prefaces.
`;

        const aiResult = await extractEntities(prompt, z.object({ tailoredResume: z.string() }), {
          systemPrompt: 'You are an elite, highly accurate ATS Resume writing AI. Always output valid JSON conforming to the requested schema.'
        });
        
        tailoredResume = aiResult.tailoredResume;
      } catch (e) {
        console.warn('AI tailored resume generation failed, falling back to template.', e);
        // Fallback below
      }
    }

    if (!tailoredResume) {
      // Free/No-API fallback template
      tailoredResume = `[AI TAILORED RESUME PREVIEW - AI Offline]

${profile?.basics?.name || user.name || 'Your Name'}
${session.user.email} | Contact Number | LinkedIn Profile

PROFESSIONAL SUMMARY
Highly motivated professional with experience aligning to the requirements of this role. Proven ability to deliver results and leverage skills such as ${result.missingSkills.slice(0, 3).join(', ')}.

SKILLS
${result.matchedSkills.join(', ')}, ${result.missingSkills.join(', ')}

EXPERIENCE
[Your Company] - [Your Role]
• Leveraged ${result.matchedSkills[0] || 'core skills'} to achieve significant business outcomes.
• Addressed gaps in previous processes by utilizing ${result.missingSkills[0] || 'new methodologies'}.
• Note: Connect an AI provider in settings to automatically write your full bullet points.

EDUCATION
[Your Degree] - [Your University]`;
    }

    return NextResponse.json({
      score: result.score,
      breakdown: result.breakdown,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      actionableChanges: result.actionableChanges,
      tailoredResume: tailoredResume
    });

  } catch (error: any) {
    console.error('ATS Analysis Error:', error);
    return NextResponse.json({ error: 'Analysis Failed: ' + error.message }, { status: 500 });
  }
}

