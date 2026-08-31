export interface UserState {
  hasResume: boolean;
  resumeHealthScore: number;
  hasTargetRole: boolean;
  recentInterviewScore: number | null;
  upcomingApplications: number;
  skillGapsDetected: boolean;
}

export interface NextAction {
  id: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  ctaText: string;
  ctaLink: string;
}

export function computeNextBestActions(state: UserState): NextAction[] {
  const actions: NextAction[] = [];

  // P0 Priorities (Blockers)
  if (!state.hasResume) {
    actions.push({
      id: 'nba_create_resume',
      title: 'Upload or Build Your Resume',
      description: 'You need a resume to unlock Rolevia\'s intelligence features.',
      priority: 'P0',
      ctaText: 'Build Resume',
      ctaLink: '/dashboard/resumes'
    });
  }

  if (state.hasResume && state.resumeHealthScore < 60) {
    actions.push({
      id: 'nba_improve_resume',
      title: 'Critical Resume Improvements Needed',
      description: 'Your resume health is critically low. Fix the ATS and content issues before applying.',
      priority: 'P0',
      ctaText: 'Improve Resume',
      ctaLink: '/dashboard/resume-intelligence'
    });
  }

  if (!state.hasTargetRole) {
    actions.push({
      id: 'nba_set_target',
      title: 'Define Your Target Role',
      description: 'Rolevia needs to know what job you want to personalize your roadmap.',
      priority: 'P0',
      ctaText: 'Set Target Role',
      ctaLink: '/dashboard/profile'
    });
  }

  // P1 Priorities (Practice & Gaps)
  if (state.recentInterviewScore !== null && state.recentInterviewScore < 70) {
    actions.push({
      id: 'nba_interview_practice',
      title: 'Address Interview Weaknesses',
      description: 'Your recent mock interview highlighted areas for improvement.',
      priority: 'P1',
      ctaText: 'Start Practice',
      ctaLink: '/dashboard/interview'
    });
  }

  if (state.skillGapsDetected) {
    actions.push({
      id: 'nba_skill_gap',
      title: 'Bridge Your Skill Gaps',
      description: 'You are missing key skills required for your target role.',
      priority: 'P1',
      ctaText: 'View Skill Gaps',
      ctaLink: '/dashboard/skills/gaps'
    });
  }

  // P2 Priorities (Maintenance)
  if (state.upcomingApplications > 0 && state.resumeHealthScore >= 60) {
    actions.push({
      id: 'nba_prep_application',
      title: 'Prepare for Upcoming Applications',
      description: 'Tailor your resume for your upcoming job applications.',
      priority: 'P2',
      ctaText: 'Application Autopilot',
      ctaLink: '/dashboard/jobs/autopilot'
    });
  }

  // Sort by priority (P0 > P1 > P2)
  return actions.sort((a, b) => a.priority.localeCompare(b.priority));
}
