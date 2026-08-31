import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { consumeCredit } from '@/lib/monetization/credits';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        personalCareerModel: true,
        intelligenceReports: { take: 1, orderBy: { createdAt: 'desc' } },
        interviewSessions: { 
          take: 3, 
          orderBy: { createdAt: 'desc' },
          include: { evaluation: true }
        },
        applications: { take: 5, orderBy: { updatedAt: 'desc' } },
        codingSubmissions: { take: 5, orderBy: { submittedAt: 'desc' } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { query } = await req.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query prompt is required' }, { status: 400 });
    }

    const q = query.toLowerCase().trim();
    const model = user.personalCareerModel;
    const latestReport = user.intelligenceReports[0];
    const latestInterview = user.interviewSessions[0];

    // Compute grounded answer based on user verified career facts
    let responseText = '';
    let actionRecommendation = {
      label: 'Explore Career Dashboard',
      link: '/dashboard'
    };

    if (q.includes('what should i do') || q.includes('next action') || q.includes('today')) {
      if (!latestReport) {
        responseText = `Your primary priority today is running a full scan on your master resume. You do not currently have an active ATS report indexed. Scanning your resume will unlock personalized skill gap radar and interview recommendations.`;
        actionRecommendation = { label: 'Upload & Scan Resume', link: '/dashboard/resume-intelligence' };
      } else if ((latestReport.atsScore ?? 0) < 75) {
        responseText = `Based on your latest ATS scan (${latestReport.atsScore ?? 0}/100), your next best action is resolving your ${latestReport.actionPlan ? 'flagged ATS formatting & section' : 'formatting'} issues in Resume Studio.`;
        actionRecommendation = { label: 'Fix ATS Issues in Studio', link: `/dashboard/resumes` };
      } else if (user.applications.length === 0) {
        responseText = `Your resume ATS score is solid (${latestReport.atsScore ?? 0}/100). Your next best action is analyzing a target job description to compute your match percentage and save your first target application.`;
        actionRecommendation = { label: 'Analyze Target Job', link: '/dashboard/jobs/new' };
      } else {
        responseText = `You have ${user.applications.length} active applications. Recommended next step: run a 5-question mock interview round to build your interview readiness score before recruiter screening calls.`;
        actionRecommendation = { label: 'Start Mock Interview', link: '/dashboard/interview' };
      }
    } else if (q.includes('ats score') || q.includes('why is my score') || q.includes('resume')) {
      if (latestReport) {
        const atsScore = latestReport.atsScore ?? 0;
        const recruiterScore = latestReport.recruiterScore ?? 0;
        responseText = `Your latest scan scored **${atsScore}/100 on ATS Compatibility** and **${recruiterScore}/100 on Recruiter Readiness**. Core findings: Ensure all standard headings (Experience, Skills, Education) are formatted cleanly with measurable impact bullets.`;
        actionRecommendation = { label: 'Open ATS Breakdown', link: `/dashboard/resume-intelligence/${latestReport.id}` };
      } else {
        responseText = `You haven't scanned a resume yet. Run an ATS check in the Resume Intelligence Lab to see your score and personalized recommendations.`;
        actionRecommendation = { label: 'Run ATS Scan', link: '/dashboard/resume-intelligence' };
      }
    } else if (q.includes('missing') || q.includes('skills') || q.includes('gaps')) {
      const skillsArray = (model?.skills as any[]) || [];
      const targets = (model?.targetRoles as string[]) || ['Software Engineer'];
      responseText = `For your target role (${targets.join(', ')}), you currently have ${skillsArray.length} verified competencies recorded in your Career Evidence Graph. Visit the Skill Gaps Radar to compare your competencies against market requirements.`;
      actionRecommendation = { label: 'View Skill Gap Radar', link: '/dashboard/skills/gaps' };
    } else if (q.includes('job') || q.includes('prioritize') || q.includes('apply')) {
      responseText = `Your Application Autopilot ranks target opportunities by composite score: Job Match × Resume Alignment × Skill Readiness × Interview Confidence. Check your ranked target list on the Autopilot hub.`;
      actionRecommendation = { label: 'Open Application Autopilot', link: '/dashboard/jobs/autopilot' };
    } else if (q.includes('interview') || q.includes('practice') || q.includes('mock')) {
      if (latestInterview) {
        responseText = `In your recent mock interview for ${latestInterview.title || latestInterview.targetRole || 'target role'}, you scored ${latestInterview.evaluation?.overallScore ?? 'N/A'}/100. Practice adaptive follow-ups in technical and behavioral areas to improve your response structure.`;
        actionRecommendation = { label: 'Practice Mock Interview', link: '/dashboard/interview' };
      } else {
        responseText = `You haven't completed a mock interview simulation yet. Start with a 5-question HR or Technical simulation to establish your baseline readiness index.`;
        actionRecommendation = { label: 'Launch First Interview', link: '/dashboard/interview/new' };
      }
    } else {
      responseText = `I am your Rolevia Career Intelligence Copilot. Based on your profile (${model?.experienceLevel || 'Candidate'} targeting ${((model?.targetRoles as string[]) || ['Tech Roles']).join(', ')}), I can help you analyze your ATS scores, identify skill gaps, prioritize applications, and prepare for interviews.`;
      actionRecommendation = { label: 'View Career Readiness', link: '/dashboard/readiness' };
    }

    return NextResponse.json({
      success: true,
      query,
      answer: responseText,
      recommendation: actionRecommendation,
      context: {
        targetRole: (model?.targetRoles as string[])?.[0] || 'Software Engineer',
        latestAtsScore: latestReport?.atsScore ?? null,
        activeApplicationsCount: user.applications.length
      }
    });
  } catch (error: any) {
    console.error('[Copilot API Error]:', error);
    return NextResponse.json({ error: 'Failed to process copilot query.' }, { status: 500 });
  }
}
