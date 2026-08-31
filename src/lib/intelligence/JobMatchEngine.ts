/**
 * Rolevia Job Match Engine
 * Scores how well a resume aligns with a specific job description.
 * Evidence-traced — every dimension shows what caused the score.
 * Does NOT fabricate skill matches.
 */

import roleTemplatesData from '@/data/ats_datasets/role_templates.json';
import { analyzeKeywords } from './KeywordEngine';
import { getLevelExpectations, estimateYearsOfExperience, type CareerLevel } from './CareerLevelAdapter';
import type { ParsedResume } from './ResumeParser';

const ROLE_TEMPLATES = roleTemplatesData.roleTemplates as Record<string, any>;

export interface JobMatchDimension {
  dimension: string;
  score: number;       // 0–100
  weight: number;      // 0–1
  status: 'STRONG' | 'PARTIAL' | 'GAP';
  evidence: string;
  recommendation: string;
}

export interface JobMatchResult {
  jobMatchScore: number;         // 0–100 weighted
  dimensions: JobMatchDimension[];
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
}

// ── Role normalization ────────────────────────────────────────────────────────

function normalizeRole(rawRole: string): string {
  const lower = rawRole.toLowerCase();
  if (/software\s*engineer|swe|developer/.test(lower)) return 'software-engineer';
  if (/data\s*scien/.test(lower)) return 'data-scientist';
  if (/product\s*manager|pm\b/.test(lower)) return 'product-manager';
  if (/frontend|front.end|ui\s*developer/.test(lower)) return 'frontend-developer';
  if (/backend|back.end|server.side/.test(lower)) return 'backend-developer';
  if (/devops|sre|site\s*reliability|platform\s*engineer/.test(lower)) return 'devops-engineer';
  if (/security|cybersec|infosec/.test(lower)) return 'cybersecurity-analyst';
  return 'default';
}

// ── Main Engine ───────────────────────────────────────────────────────────────

export function analyzeJobMatch(params: {
  parsed: ParsedResume;
  jdText: string;
  targetRole?: string | null;
  experienceLevel?: CareerLevel | null;
}): JobMatchResult {
  const { parsed, jdText, targetRole, experienceLevel } = params;
  const dimensions: JobMatchDimension[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];

  const levelExpectations = getLevelExpectations(experienceLevel);
  const roleKey = normalizeRole(targetRole ?? '');
  const roleTemplate = ROLE_TEMPLATES[roleKey] ?? ROLE_TEMPLATES['default'];

  // ── Dimension 1: Keyword Coverage ────────────────────────────────────────
  const kwResult = analyzeKeywords(
    { sections: parsed.sections, rawText: parsed.rawText },
    jdText
  );

  const matchedSkills = kwResult.keywordMatches
    .filter(k => k.status === 'FOUND')
    .map(k => k.keyword);
  const partialSkills = kwResult.keywordMatches
    .filter(k => k.status === 'PARTIAL')
    .map(k => k.keyword);
  const missingSkills = kwResult.keywordMatches
    .filter(k => k.status === 'MISSING' && k.importance === 'REQUIRED')
    .map(k => k.keyword);

  dimensions.push({
    dimension: 'Keyword Coverage',
    score: kwResult.matchScore,
    weight: 0.35,
    status: kwResult.matchScore >= 70 ? 'STRONG' : kwResult.matchScore >= 40 ? 'PARTIAL' : 'GAP',
    evidence: `${kwResult.foundKeywords} of ${kwResult.totalKeywords} keywords matched.`,
    recommendation: kwResult.missingKeywords > 0
      ? `Add missing required keywords: ${missingSkills.slice(0, 3).join(', ')}.`
      : 'Keyword coverage is strong.',
  });

  if (kwResult.matchScore >= 70) strengths.push('Strong keyword alignment with job description');
  if (missingSkills.length > 0) gaps.push(`Missing required skills: ${missingSkills.slice(0, 3).join(', ')}`);

  // ── Dimension 2: Experience Alignment ────────────────────────────────────
  const estimatedYears = estimateYearsOfExperience(parsed.rawText);
  const jdYearsMatch = jdText.match(/(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp\.)/i);
  const requiredYears = jdYearsMatch ? parseInt(jdYearsMatch[1]) : 0;

  let expScore = 70; // default moderate
  let expEvidence = 'No specific years requirement found in job description.';

  if (requiredYears > 0 && estimatedYears > 0) {
    if (estimatedYears >= requiredYears) {
      expScore = 90;
      expEvidence = `Estimated ${estimatedYears} years of experience meets the ${requiredYears}+ year requirement.`;
      strengths.push(`Experience level (${estimatedYears}y) meets JD requirement (${requiredYears}y+)`);
    } else if (estimatedYears >= requiredYears * 0.7) {
      expScore = 60;
      expEvidence = `Estimated ${estimatedYears} years — slightly below the ${requiredYears}+ year requirement.`;
    } else {
      expScore = 35;
      expEvidence = `Estimated ${estimatedYears} years — below the ${requiredYears}+ year requirement.`;
      gaps.push(`Experience: ${estimatedYears}y estimated vs ${requiredYears}y+ required`);
    }
  }

  dimensions.push({
    dimension: 'Experience Alignment',
    score: expScore,
    weight: 0.20,
    status: expScore >= 70 ? 'STRONG' : expScore >= 45 ? 'PARTIAL' : 'GAP',
    evidence: expEvidence,
    recommendation: expScore < 60 && requiredYears > 0
      ? 'Emphasize the depth and impact of your experience to compensate for years gap.'
      : '',
  });

  // ── Dimension 3: Role Alignment ───────────────────────────────────────────
  const hasRoleMatch = targetRole
    ? parsed.rawText.toLowerCase().includes(targetRole.toLowerCase().split(' ')[0])
    : false;

  const roleAlignmentScore = hasRoleMatch ? 85 : 60;
  dimensions.push({
    dimension: 'Role Alignment',
    score: roleAlignmentScore,
    weight: 0.15,
    status: roleAlignmentScore >= 70 ? 'STRONG' : 'PARTIAL',
    evidence: hasRoleMatch
      ? `Target role "${targetRole}" terminology found in resume.`
      : targetRole
      ? `Target role "${targetRole}" terminology not prominent in resume.`
      : 'No target role specified.',
    recommendation: !hasRoleMatch && targetRole
      ? `Incorporate the exact role title "${targetRole}" in your summary or experience headings.`
      : '',
  });

  // ── Dimension 4: Education Alignment ─────────────────────────────────────
  const hasEducation = parsed.sections.some(s => s.type === 'education');
  const jdRequiresDegree = /\b(bachelor|master|phd|degree|b\.tech|m\.tech|b\.e\.)\b/i.test(jdText);

  let eduScore = 70;
  if (jdRequiresDegree && !hasEducation) {
    eduScore = 30;
    gaps.push('Education section missing — JD requires a degree');
  } else if (hasEducation) {
    eduScore = 85;
  }

  dimensions.push({
    dimension: 'Education Alignment',
    score: eduScore,
    weight: levelExpectations.educationWeight > 0.4 ? 0.15 : 0.05,
    status: eduScore >= 70 ? 'STRONG' : 'GAP',
    evidence: hasEducation ? 'Education section present.' : jdRequiresDegree
      ? 'JD requires a degree but no education section found.'
      : 'No specific education requirement in JD.',
    recommendation: !hasEducation ? 'Add your education details.' : '',
  });

  // ── Dimension 5: Domain Keywords ──────────────────────────────────────────
  const roleExpectedKws: string[] = roleTemplate?.expectedKeywords ?? [];
  let domainMatched = 0;
  for (const kw of roleExpectedKws) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(parsed.rawText)) domainMatched++;
  }

  const domainScore = roleExpectedKws.length > 0
    ? Math.round((domainMatched / roleExpectedKws.length) * 100)
    : 70;

  dimensions.push({
    dimension: 'Domain Alignment',
    score: domainScore,
    weight: 0.15,
    status: domainScore >= 70 ? 'STRONG' : domainScore >= 40 ? 'PARTIAL' : 'GAP',
    evidence: roleExpectedKws.length > 0
      ? `${domainMatched} of ${roleExpectedKws.length} domain keywords found.`
      : 'No specific domain keywords to check.',
    recommendation: domainScore < 60 && roleExpectedKws.length > 0
      ? `Add domain terms: ${roleExpectedKws.filter(kw => !new RegExp(`\\b${kw}\\b`, 'i').test(parsed.rawText)).slice(0, 3).join(', ')}`
      : '',
  });

  // ── Final Weighted Score ──────────────────────────────────────────────────
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);
  const jobMatchScore = Math.round(
    dimensions.reduce((s, d) => s + (d.score * d.weight), 0) / totalWeight
  );

  const summary = jobMatchScore >= 80
    ? `Strong job match (${jobMatchScore}/100). Your resume aligns well with this role.`
    : jobMatchScore >= 60
    ? `Moderate job match (${jobMatchScore}/100). ${gaps.length} gap(s) identified.`
    : `Weak job match (${jobMatchScore}/100). Significant gaps exist between your resume and the job requirements.`;

  return {
    jobMatchScore,
    dimensions,
    matchedSkills,
    partialSkills,
    missingSkills,
    strengths,
    gaps,
    summary,
  };
}
