import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch saved job targets with match analyses
    const jobs = await prisma.jobTarget.findMany({
      where: { userId: user.id },
      include: { matchAnalysis: true }
    });

    // 2. Fetch latest parsed resume intelligence reports
    const resumeReports = await prisma.resumeIntelligenceReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    const latestReport = resumeReports[0];

    // 3. Fetch personal career model (skill readiness)
    const careerModel = await prisma.personalCareerModel.findUnique({
      where: { userId: user.id }
    });

    // 4. Fetch completed mock interviews (interview readiness)
    const interviewSessions = await prisma.interviewSession.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' }
    });

    // Compile dynamic autopilot recommendations
    const rankedApplications = jobs.map(job => {
      // Metric 1: Job Match Score (from JD analysis or default)
      const jobMatch = (job.matchAnalysis?.overallScore || 70) / 100;

      // Metric 2: Resume Match Score (from latest resume intelligence or default)
      const resumeMatch = (latestReport?.careerOsScore || 75) / 100;

      // Metric 3: Skill Readiness (ratio of matched skills in career model)
      const userSkills = (careerModel?.skills as any[]) || [];
      const matchedSkills = userSkills.filter((s: any) => s.level === 'Advanced' || s.level === 'Expert');
      const skillReadiness = userSkills.length > 0 ? (matchedSkills.length / userSkills.length) : 0.65;

      // Metric 4: Interview Readiness (average score of past completed sessions)
      const completedAvg = interviewSessions.length > 0
        ? interviewSessions.reduce((acc, curr) => {
            const assistantLogs = (curr.conversationLog as any[] || []).filter(l => l.role === 'assistant');
            const avg = assistantLogs.length > 0 ? (assistantLogs.reduce((a, b) => a + (b.score || 80), 0) / assistantLogs.length) : 75;
            return acc + avg;
          }, 0) / interviewSessions.length
        : 70;
      const interviewReadiness = completedAvg / 100;

      // Metric 5: Application Priority Weight (default to 0.9, high priority to 1.0)
      const priority = 0.9;

      // Calculate composite score
      const autopilotIndex = Math.round((jobMatch * resumeMatch * skillReadiness * interviewReadiness * priority) * 100);

      // Determine best action advice
      let actionAdvice = 'Apply now';
      let actionBadge = 'APPLY_NOW';
      let actionReason = 'Highly optimized profile match. Safe to apply.';

      const minScore = Math.min(jobMatch, resumeMatch, skillReadiness, interviewReadiness);

      if (autopilotIndex < 85) {
        if (minScore === resumeMatch) {
          actionAdvice = 'Fix resume first';
          actionBadge = 'FIX_RESUME';
          actionReason = `Your resume parse score is low (${Math.round(resumeMatch * 100)}%). Resolve raw ATS simulator warnings before submitting.`;
        } else if (minScore === skillReadiness) {
          actionAdvice = 'Learn skill first';
          actionBadge = 'LEARN_SKILL';
          actionReason = 'Identified structural skill gaps in your target role competency index. Update career roadmap.';
        } else if (minScore === interviewReadiness) {
          actionAdvice = 'Practice interview first';
          actionBadge = 'PRACTICE_INTERVIEW';
          actionReason = `Your mock interview preparedness average is ${Math.round(interviewReadiness * 100)}%. Conduct a simulated practice run.`;
        } else {
          actionAdvice = 'Fix resume first';
          actionBadge = 'FIX_RESUME';
          actionReason = 'Improve keyword overlap on key role competencies to bypass corporate algorithms.';
        }
      }

      return {
        id: job.id,
        company: job.company,
        roleTitle: job.roleTitle,
        autopilotScore: autopilotIndex,
        actionAdvice,
        actionBadge,
        actionReason,
        metrics: {
          jobMatch: Math.round(jobMatch * 100),
          resumeMatch: Math.round(resumeMatch * 100),
          skillReadiness: Math.round(skillReadiness * 100),
          interviewReadiness: Math.round(interviewReadiness * 100)
        }
      };
    });

    // Sort by autopilot score descending
    rankedApplications.sort((a, b) => b.autopilotScore - a.autopilotScore);

    return NextResponse.json({
      recommendations: rankedApplications,
      profileComplete: !!careerModel
    });
  } catch (error: any) {
    console.error('[GET /api/jobs/autopilot]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
