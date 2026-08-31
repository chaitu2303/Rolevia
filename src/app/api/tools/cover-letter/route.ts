import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { askGateway, isAiAvailable } from '@/lib/ai/gateway';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId, jobDescription, tone, companyName, recipientName } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    // Fetch user resume details
    let resumeFacts = '';
    let applicantName = session.user.name || 'Candidate';
    let email = session.user.email || '';
    let phone = '';

    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: session.user.id },
        include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
      });

      if (resume) {
        const latestVersion = resume.versions[0];
        if (latestVersion && latestVersion.content) {
          const content = latestVersion.content as any;
          applicantName = content.personalInfo?.name || applicantName;
          email = content.personalInfo?.email || email;
          phone = content.personalInfo?.phone || '';

          // Gather experience bullets as facts
          const exp = content.experience || [];
          const bullets = exp.flatMap((e: any) => e.highlights || e.bullets || []);
          resumeFacts = bullets.slice(0, 15).join('\n');
        }
      }
    }

    // If no resume selected or found, fallback to basic profile facts
    if (!resumeFacts) {
      const profile = await prisma.careerProfile.findUnique({
        where: { userId: session.user.id },
        include: { basics: true }
      });
      if (profile?.basics?.summary) {
        resumeFacts = profile.basics.summary;
      } else {
        resumeFacts = 'Ambitious professional seeking new opportunities.';
      }
    }

    const recipient = recipientName || 'Hiring Manager';
    const company = companyName || 'your esteemed organization';

    // Tone map description
    const toneDescription = {
      ambitious: 'confident, visionary, bold, highlighting high-impact growth statistics',
      editorial: 'clean, elegant, sophisticated, clear typography feel, professional, narrative-driven',
      human: 'warm, personable, authentic, storytelling, highlighting collaboration and passion',
      direct: 'concise, impact-focused, zero fluff, straight to the point, numbers-oriented'
    }[tone as 'ambitious' | 'editorial' | 'human' | 'direct'] || 'professional and balanced';

    let generatedLetter = '';

    if (isAiAvailable()) {
      const responseText = await askGateway(`
Applicant details:
Name: ${applicantName}
Email: ${email}
Phone: ${phone}

Target Company: ${company}
Recipient: ${recipient}

Job Description:
${jobDescription}

Candidate Resume Evidence Facts:
${resumeFacts}
      `, {
        systemPrompt: `You are an expert executive cover letter writer for Rolevia. 
Your goal is to write a highly tailored, evidence-backed cover letter that connects the candidate's actual history (bullets) to the job description without fabricating or making up any facts. 
Write in a ${toneDescription} tone. Use standard business letter formatting. Keep it to 3-4 paragraphs.`
      });

      generatedLetter = responseText;
    } else {
      // Deterministic Fallback Cover Letter Generator (zero hallucination, matches exact facts)
      const opening = `Dear ${recipient},\n\nI am writing to express my strong interest in joining ${company}. Based on the requirements outlined in the job description, I am confident that my background matches your needs.`;
      
      // Match candidate facts that have overlapping keywords with JD
      const jdWords = new Set(jobDescription.toLowerCase().split(/\W+/));
      const facts = resumeFacts.split('\n').filter(Boolean);
      const matchedFacts = facts.filter(f => {
        const words = f.toLowerCase().split(/\W+/);
        return words.some(w => w.length > 4 && jdWords.has(w));
      });

      const keyBullets = (matchedFacts.length > 0 ? matchedFacts : facts).slice(0, 3);
      
      const body = `Throughout my career, I have focused on delivering measurable outcomes. Some of my key highlights include:\n\n${keyBullets.map(b => `• ${b}`).join('\n')}`;
      
      const closing = `I would welcome the opportunity to discuss how my qualifications align with the goals of ${company}. Thank you for your time and consideration.\n\nSincerely,\n\n${applicantName}\n${email}\n${phone}`;

      generatedLetter = `${opening}\n\n${body}\n\n${closing}`;
    }

    // Log the action to UsageLedger
    await prisma.usageLedger.create({
      data: {
        userId: session.user.id,
        feature: 'TAILOR',
        actionType: 'TAILOR',
        metadata: { tool: 'COVER_LETTER', tone, companyName }
      }
    });

    return NextResponse.json({ coverLetter: generatedLetter });
  } catch (error: any) {
    console.error('[POST /api/tools/cover-letter]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
