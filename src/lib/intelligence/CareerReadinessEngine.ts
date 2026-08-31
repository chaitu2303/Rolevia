export interface ReadinessProfile {
  resumeHealth: number; // 0-100
  skillCoverage: number; // 0-100
  projectQuality: number; // 0-100
  interviewPerformance: number; // 0-100
  applicationActivity: number; // 0-100
  profileCompleteness: number; // 0-100
}

export interface ReadinessResult {
  overallScore: number;
  readinessLevel: 'NOT_READY' | 'DEVELOPING' | 'READY' | 'HIGHLY_COMPETITIVE';
  breakdown: ReadinessProfile;
  evidence: string[];
}

export function computeCareerReadiness(profile: ReadinessProfile): ReadinessResult {
  // Weighted calculation for Rolevia Readiness Score
  const weights = {
    resumeHealth: 0.3,
    skillCoverage: 0.2,
    projectQuality: 0.15,
    interviewPerformance: 0.2,
    applicationActivity: 0.05,
    profileCompleteness: 0.1
  };

  const overallScore = Math.round(
    profile.resumeHealth * weights.resumeHealth +
    profile.skillCoverage * weights.skillCoverage +
    profile.projectQuality * weights.projectQuality +
    profile.interviewPerformance * weights.interviewPerformance +
    profile.applicationActivity * weights.applicationActivity +
    profile.profileCompleteness * weights.profileCompleteness
  );

  let readinessLevel: ReadinessResult['readinessLevel'] = 'NOT_READY';
  if (overallScore >= 85) readinessLevel = 'HIGHLY_COMPETITIVE';
  else if (overallScore >= 70) readinessLevel = 'READY';
  else if (overallScore >= 50) readinessLevel = 'DEVELOPING';

  const evidence: string[] = [];
  if (profile.resumeHealth >= 80) evidence.push('Strong resume health indicates high ATS pass probability.');
  else evidence.push('Resume health needs improvement before active applying.');

  if (profile.interviewPerformance >= 80) evidence.push('Consistent high performance in mock interviews.');
  else if (profile.interviewPerformance < 50) evidence.push('Interview skills require practice, specifically in weak areas.');

  if (profile.skillCoverage >= 75) evidence.push('Good coverage of skills required for target role.');
  else evidence.push('Significant skill gaps identified for target role.');

  return {
    overallScore,
    readinessLevel,
    breakdown: profile,
    evidence
  };
}
