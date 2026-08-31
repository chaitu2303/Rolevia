/**
 * Rolevia Content Quality Engine
 * Evaluates resume content completeness, section quality, and professionalism.
 * Adapted for career level — fresher vs senior expectations differ.
 */

import fillerData from '@/data/ats_datasets/filler_words.json';
import type { ParsedResume } from './ResumeParser';
import { getLevelExpectations, type CareerLevel } from './CareerLevelAdapter';
import { analyzeBullets, getBulletsSummary } from './BulletAnalyzer';

const FILLER_PHRASES: string[] = fillerData.fillerPhrases;
const CLICHE_PHRASES: string[] = fillerData.clichePhrases;
const PASSIVE_PATTERNS: string[] = fillerData.passiveVoicePatterns;

export interface ContentCheck {
  id: string;
  section: string;
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  recommendation: string;
  scoreImpact: number;
}

export interface ContentQualityResult {
  contentScore: number;
  checks: ContentCheck[];
  strengths: string[];
  fillerPhrasesFound: string[];
  passiveVoiceCount: number;
  summary: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countOccurrences(text: string, phrase: string): number {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = text.toLowerCase().match(new RegExp(escaped, 'gi'));
  return matches ? matches.length : 0;
}

function detectPassiveVoice(text: string): number {
  let count = 0;
  for (const pattern of PASSIVE_PATTERNS) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = text.match(new RegExp(escaped, 'gi'));
    if (matches) count += matches.length;
  }
  return count;
}

function findFillerPhrases(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of [...FILLER_PHRASES, ...CLICHE_PHRASES]) {
    if (lower.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  return [...new Set(found)];
}

// ── Main Engine ───────────────────────────────────────────────────────────────

export function analyzeContentQuality(
  parsed: ParsedResume,
  experienceLevel?: CareerLevel | null,
): ContentQualityResult {
  const level = getLevelExpectations(experienceLevel);
  const checks: ContentCheck[] = [];
  const strengths: string[] = [];
  let scoreBase = 100;

  const sectionTypes = parsed.sections.map(s => s.type);
  const text = parsed.rawText;

  // ── Summary Section ────────────────────────────────────────────────────────
  const hasSummary = sectionTypes.includes('summary');
  if (level.summaryExpected && !hasSummary) {
    checks.push({
      id: 'no_summary',
      section: 'summary',
      label: 'Professional Summary Missing',
      status: 'WARN',
      severity: 'MEDIUM',
      evidence: 'No summary/objective section detected.',
      recommendation: 'Add a 2–3 sentence professional summary that states your role, years of experience, and top strength.',
      scoreImpact: -8,
    });
    scoreBase -= 8;
  } else if (hasSummary) {
    const summarySection = parsed.sections.find(s => s.type === 'summary');
    const summaryText = summarySection?.content ?? '';
    const wordCount = summaryText.trim().split(/\s+/).length;

    if (wordCount < 20) {
      checks.push({
        id: 'summary_too_short',
        section: 'summary',
        label: 'Summary Too Brief',
        status: 'WARN',
        severity: 'LOW',
        evidence: `Summary is only ${wordCount} words.`,
        recommendation: 'Expand your summary to 40–80 words. Include your role, experience level, and top 2–3 skills.',
        scoreImpact: -5,
      });
    } else if (wordCount > 120) {
      checks.push({
        id: 'summary_too_long',
        section: 'summary',
        label: 'Summary Too Long',
        status: 'WARN',
        severity: 'LOW',
        evidence: `Summary is ${wordCount} words. Recruiters spend 6–7 seconds on the initial scan.`,
        recommendation: 'Trim your summary to 40–80 words. Cut filler adjectives and keep only the strongest claims.',
        scoreImpact: -3,
      });
    } else {
      strengths.push('Professional summary detected with appropriate length');
    }
  }

  // ── Experience Section ─────────────────────────────────────────────────────
  const hasExperience = sectionTypes.includes('experience');
  const experienceSection = parsed.sections.find(s => s.type === 'experience');
  const expBullets = experienceSection?.bullets ?? [];

  if (!hasExperience && !sectionTypes.includes('projects')) {
    checks.push({
      id: 'no_experience_or_projects',
      section: 'experience',
      label: 'No Experience or Projects',
      status: 'FAIL',
      severity: 'CRITICAL',
      evidence: 'Neither an Experience section nor a Projects section was detected.',
      recommendation: level.projectsRequired
        ? 'Add a Projects section showcasing academic or personal projects with tech stack and outcomes.'
        : 'Add your work experience history.',
      scoreImpact: -25,
    });
    scoreBase -= 25;
  } else if (hasExperience) {
    // Bullet count check
    if (expBullets.length < level.minBulletsPerRole && expBullets.length > 0) {
      checks.push({
        id: 'insufficient_bullets',
        section: 'experience',
        label: 'Too Few Experience Bullets',
        status: 'WARN',
        severity: 'MEDIUM',
        evidence: `Only ${expBullets.length} bullets detected in experience section.`,
        recommendation: `Add ${level.minBulletsPerRole - expBullets.length} more achievement bullets per role. Each bullet should show Action + Technology + Result.`,
        scoreImpact: -8,
      });
      scoreBase -= 8;
    } else if (expBullets.length >= 3) {
      strengths.push(`${expBullets.length} experience bullets detected — good coverage`);
    }

    // Leadership signal for senior levels
    if (level.leadershipExpected) {
      const hasLeadership = /\b(led|managed|directed|supervised|mentored|owned|oversee)\b/i.test(text);
      if (!hasLeadership) {
        checks.push({
          id: 'no_leadership_signals',
          section: 'experience',
          label: 'No Leadership Signals',
          status: 'WARN',
          severity: 'MEDIUM',
          evidence: `At the ${level.label} level, recruiters expect leadership evidence.`,
          recommendation: 'Add bullets showing: team size managed, decisions owned, cross-functional leadership, or junior staff mentored.',
          scoreImpact: -8,
        });
        scoreBase -= 8;
      } else {
        strengths.push('Leadership language detected — signals ownership and seniority');
      }
    }
  }

  // ── Education Section ──────────────────────────────────────────────────────
  if (!sectionTypes.includes('education')) {
    checks.push({
      id: 'no_education',
      section: 'education',
      label: 'Education Section Missing',
      status: 'WARN',
      severity: 'HIGH',
      evidence: 'No education section detected.',
      recommendation: 'Add your highest level of education: degree, institution, year, and GPA if strong (3.5+).',
      scoreImpact: -10,
    });
    scoreBase -= 10;
  } else {
    strengths.push('Education section present');
  }

  // ── Skills Section ────────────────────────────────────────────────────────
  if (!sectionTypes.includes('skills')) {
    checks.push({
      id: 'no_skills',
      section: 'skills',
      label: 'Skills Section Missing',
      status: 'WARN',
      severity: 'HIGH',
      evidence: 'No skills section detected.',
      recommendation: 'Add a dedicated Skills section with your technical skills grouped by category (e.g., Languages, Frameworks, Tools).',
      scoreImpact: -10,
    });
    scoreBase -= 10;
  } else {
    const skillsSection = parsed.sections.find(s => s.type === 'skills');
    const skillText = skillsSection?.content ?? '';
    const skillCount = skillText.split(/[,|\n•]/).filter(s => s.trim().length > 1).length;

    if (skillCount < 5) {
      checks.push({
        id: 'too_few_skills',
        section: 'skills',
        label: 'Too Few Skills Listed',
        status: 'WARN',
        severity: 'MEDIUM',
        evidence: `Approximately ${skillCount} skills detected.`,
        recommendation: 'List at least 8–15 relevant skills including languages, frameworks, tools, and soft skills.',
        scoreImpact: -5,
      });
      scoreBase -= 5;
    } else {
      strengths.push(`Skills section with approximately ${skillCount} skills detected`);
    }
  }

  // ── Filler & Cliché Detection ──────────────────────────────────────────────
  const fillerFound = findFillerPhrases(text);
  if (fillerFound.length > 0) {
    checks.push({
      id: 'filler_phrases',
      section: 'general',
      label: 'Filler / Cliché Phrases',
      status: 'WARN',
      severity: 'LOW',
      evidence: `Found: "${fillerFound.slice(0, 3).join('", "')}"`,
      recommendation: 'Remove vague phrases like "team player", "hard worker", "results-driven". Replace with specific achievements that demonstrate these qualities.',
      scoreImpact: fillerFound.length > 3 ? -8 : -4,
    });
    scoreBase -= fillerFound.length > 3 ? 8 : 4;
  }

  // ── Passive Voice ─────────────────────────────────────────────────────────
  const passiveCount = detectPassiveVoice(text);
  if (passiveCount >= 3) {
    checks.push({
      id: 'passive_voice',
      section: 'general',
      label: 'Passive Voice Usage',
      status: 'WARN',
      severity: 'LOW',
      evidence: `${passiveCount} instances of passive voice detected (e.g., "was responsible for", "was tasked with").`,
      recommendation: 'Start bullets with active verbs. Replace "was responsible for X" with "Managed X" or "Led X".',
      scoreImpact: -5,
    });
    scoreBase -= 5;
  }

  // ── Bullet Analysis ────────────────────────────────────────────────────────
  const allBullets = parsed.sections.flatMap(s =>
    ['experience', 'projects'].includes(s.type) ? s.bullets : []
  );

  const bulletAnalyses = analyzeBullets(allBullets);
  const bulletSummary = getBulletsSummary(bulletAnalyses);

  if (allBullets.length > 0) {
    if (bulletSummary.avgScore < 40) {
      checks.push({
        id: 'weak_bullet_quality',
        section: 'experience',
        label: 'Bullet Point Quality',
        status: 'FAIL',
        severity: 'HIGH',
        evidence: `Average bullet score: ${bulletSummary.avgScore}/100. ${bulletSummary.weakVerbCount} weak verbs, ${allBullets.length - bulletSummary.quantifiedCount} unquantified bullets.`,
        recommendation: 'Rewrite bullets using: [Strong Action Verb] + [What you did] + [Technology] + [Result/Impact].',
        scoreImpact: -12,
      });
      scoreBase -= 12;
    } else if (bulletSummary.quantifiedCount > 0) {
      strengths.push(`${bulletSummary.quantifiedCount} of ${allBullets.length} bullets have quantified impact`);
    }
  }

  const contentScore = Math.max(0, Math.min(100, scoreBase));

  const summary = contentScore >= 80
    ? `Content quality is strong (${contentScore}/100).`
    : contentScore >= 60
    ? `Content quality is moderate (${contentScore}/100). Focus on expanding weak sections and strengthening bullets.`
    : `Content quality needs significant work (${contentScore}/100). Several sections are missing or underdeveloped.`;

  return {
    contentScore,
    checks: checks.sort((a, b) => {
      const o = { FAIL: 0, WARN: 1, PASS: 2 };
      return o[a.status] - o[b.status];
    }),
    strengths: strengths.slice(0, 6),
    fillerPhrasesFound: fillerFound,
    passiveVoiceCount: passiveCount,
    summary,
  };
}
