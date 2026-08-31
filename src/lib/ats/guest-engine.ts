/**
 * ROLEVIA Guest ATS Analysis Engine
 * Ephemeral in-memory resume parsing and ATS scoring for unauthenticated guests.
 * Does not persist or leak candidate documents to database without user consent.
 */

export interface GuestAtsResult {
  score: number;
  label: 'High ATS Compatibility' | 'Moderate ATS Risk' | 'High ATS Risk';
  grade: 'A' | 'B' | 'C' | 'D';
  breakdown: {
    contactScore: number;
    structureScore: number;
    skillsScore: number;
    formattingScore: number;
  };
  detectedSections: string[];
  missingSections: string[];
  topIssues: Array<{
    id: string;
    title: string;
    why: string;
    where: string;
    impact: string;
    fix: string;
    severity: 'CRITICAL' | 'WARNING';
  }>;
  summary: string;
}

export function analyzeGuestResume(text: string): GuestAtsResult {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // Section checks
  const standardSections = [
    { name: 'Summary / Profile', keywords: ['summary', 'profile', 'about me', 'objective'] },
    { name: 'Experience / Work History', keywords: ['experience', 'work history', 'employment', 'internships'] },
    { name: 'Education', keywords: ['education', 'academic', 'degree', 'university', 'college'] },
    { name: 'Skills / Competencies', keywords: ['skills', 'technologies', 'technical skills', 'core competencies'] },
    { name: 'Projects', keywords: ['projects', 'personal projects', 'key projects', 'open source'] }
  ];

  const detectedSections: string[] = [];
  const missingSections: string[] = [];

  standardSections.forEach(section => {
    const hasSection = section.keywords.some(k => lowerText.includes(k));
    if (hasSection) {
      detectedSections.push(section.name);
    } else {
      missingSections.push(section.name);
    }
  });

  // Contact checks
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(cleanText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleanText) || /\b\d{10}\b/.test(cleanText);
  const hasLinkedIn = lowerText.includes('linkedin.com') || lowerText.includes('linkedin');
  const hasGitHub = lowerText.includes('github.com') || lowerText.includes('github');

  let contactScore = 40;
  if (hasEmail) contactScore += 30;
  if (hasPhone) contactScore += 20;
  if (hasLinkedIn || hasGitHub) contactScore += 10;
  contactScore = Math.min(100, contactScore);

  // Structure score
  const structureScore = Math.round((detectedSections.length / standardSections.length) * 100);

  // Formatting / Action-Verb checks
  const actionVerbs = ['developed', 'engineered', 'built', 'led', 'designed', 'implemented', 'orchestrated', 'managed', 'created', 'optimized', 'reduced', 'increased'];
  const verbMatches = actionVerbs.filter(v => lowerText.includes(v));
  const formattingScore = Math.min(100, Math.round(50 + (verbMatches.length * 5)));

  // Skills density check
  const commonTech = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'html', 'css', 'git', 'docker', 'aws', 'api', 'rest', 'c++', 'c#', 'spring', 'django', 'mongodb', 'postgresql'];
  const matchedTech = commonTech.filter(t => lowerText.includes(t));
  const skillsScore = Math.min(100, Math.round(40 + (matchedTech.length * 4)));

  // Composite ATS Score
  const score = Math.round(
    (contactScore * 0.2) + 
    (structureScore * 0.35) + 
    (skillsScore * 0.25) + 
    (formattingScore * 0.2)
  );

  let label: GuestAtsResult['label'] = 'High ATS Compatibility';
  let grade: GuestAtsResult['grade'] = 'A';

  if (score < 60) {
    label = 'High ATS Risk';
    grade = 'D';
  } else if (score < 75) {
    label = 'Moderate ATS Risk';
    grade = 'C';
  } else if (score < 88) {
    label = 'High ATS Compatibility';
    grade = 'B';
  }

  // Top Issues
  const topIssues: GuestAtsResult['topIssues'] = [];

  if (missingSections.length > 0) {
    topIssues.push({
      id: 'missing-sections',
      title: `Missing Critical Section: ${missingSections[0]}`,
      why: 'ATS parsers scan for explicit standard headings to index your career history accurately.',
      where: 'Document Heading Layout',
      impact: 'Up to 25% ranking penalty across enterprise ATS software (Workday, Greenhouse, Taleo).',
      fix: `Add a standard "${missingSections[0]}" section heading formatted in bold text.`,
      severity: 'CRITICAL'
    });
  }

  if (!hasLinkedIn && !hasGitHub) {
    topIssues.push({
      id: 'missing-social-proof',
      title: 'No Professional Portfolio / LinkedIn Link Detected',
      why: 'Recruiters verify candidate authenticity via LinkedIn or GitHub profiles.',
      where: 'Contact Information Header',
      impact: 'Reduced recruiter callback probability by ~15%.',
      fix: 'Include your customized LinkedIn URL or GitHub profile in the header contact block.',
      severity: 'WARNING'
    });
  }

  if (verbMatches.length < 4) {
    topIssues.push({
      id: 'weak-action-verbs',
      title: 'Low Action Verb Density in Bullet Points',
      why: 'Passive voice weakens impact metrics and recruiter engagement.',
      where: 'Experience & Projects Bullets',
      impact: 'Diminished recruiter readiness score.',
      fix: 'Start bullet points with strong measurable verbs like "Engineered", "Implemented", or "Reduced".',
      severity: 'WARNING'
    });
  }

  return {
    score,
    label,
    grade,
    breakdown: {
      contactScore,
      structureScore,
      skillsScore,
      formattingScore
    },
    detectedSections,
    missingSections,
    topIssues,
    summary: `Your resume scored ${score}/100 with ${detectedSections.length}/${standardSections.length} core sections detected and ${matchedTech.length} indexed technical competencies.`
  };
}
