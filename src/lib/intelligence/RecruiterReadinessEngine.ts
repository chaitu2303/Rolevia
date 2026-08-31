/**
 * Rolevia Recruiter Readiness Engine
 * Evaluates first-impression signals — what a recruiter sees in the first 6 seconds.
 * Evidence-traced. No fake AI insights.
 */

import type { ParsedResume } from './ResumeParser';

export interface RecruiterSignal {
  id: string;
  category: 'First Impression' | 'Credibility' | 'Ownership' | 'Progression' | 'Formatting';
  label: string;
  status: 'STRONG' | 'NEUTRAL' | 'WEAK';
  evidence: string;
  impact: string;
}

export interface RecruiterReadinessResult {
  recruiterScore: number;
  signals: RecruiterSignal[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  firstImpressionRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const OWNERSHIP_VERBS = ['led', 'owned', 'founded', 'built', 'launched', 'created',
  'designed', 'established', 'spearheaded', 'pioneered', 'architected', 'directed',
  'managed', 'drove', 'scaled', 'grew'];

const CREDENTIAL_SIGNALS = [
  { pattern: /\b(google|amazon|apple|meta|microsoft|netflix|openai|stripe|airbnb|uber|linkedin|twitter|tesla|spacex)\b/i, label: 'Recognized company name' },
  { pattern: /\b(stanford|mit|harvard|berkeley|carnegie\s*mellon|iit|ntu|nus|oxford|cambridge)\b/i, label: 'Recognized institution name' },
  { pattern: /\b(phd|ph\.d|master|mba|m\.s\.|b\.tech|b\.e\.)\b/i, label: 'Advanced degree credential' },
  { pattern: /\b(aws\s*certified|gcp\s*certified|cka|cissp|pmp|cspo|ceh)\b/i, label: 'Professional certification' },
];

const PROGRESSION_PATTERNS = [
  /junior\s*.+senior/i,
  /associate\s*.+senior/i,
  /engineer\s*i?\s*.+senior/i,
  /intern\s*.+full.?time/i,
  /analyst\s*.+manager/i,
  /coordinator\s*.+director/i,
];

// ── Main Engine ───────────────────────────────────────────────────────────────

export function analyzeRecruiterReadiness(parsed: ParsedResume): RecruiterReadinessResult {
  const signals: RecruiterSignal[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const text = parsed.rawText;

  // ── 1. First impression: Contact completeness ────────────────────────────
  const { contact } = parsed;
  const contactScore =
    (contact.name ? 1 : 0) +
    (contact.email ? 1 : 0) +
    (contact.phone ? 1 : 0) +
    (contact.linkedinUrl ? 1 : 0);

  signals.push({
    id: 'contact_completeness',
    category: 'First Impression',
    label: 'Contact Completeness',
    status: contactScore >= 3 ? 'STRONG' : contactScore >= 2 ? 'NEUTRAL' : 'WEAK',
    evidence: `${contactScore}/4 key contact fields found (name, email, phone, LinkedIn).`,
    impact: contactScore < 3 ? 'Recruiters cannot follow up if contact info is missing.' : 'Recruiter can immediately contact you.',
  });

  if (contactScore >= 3) strengths.push('Complete contact information');
  else weaknesses.push('Incomplete contact information');

  // ── 2. GitHub / Portfolio presence ────────────────────────────────────────
  const hasGithub = !!contact.githubUrl;
  const hasPortfolio = !!contact.portfolioUrl;

  if (hasGithub || hasPortfolio) {
    signals.push({
      id: 'portfolio',
      category: 'Credibility',
      label: 'Portfolio / GitHub Link',
      status: 'STRONG',
      evidence: hasGithub ? `GitHub: ${contact.githubUrl}` : `Portfolio: ${contact.portfolioUrl}`,
      impact: 'Gives recruiters immediate proof of your work — highly valued for technical roles.',
    });
    strengths.push(hasGithub ? 'GitHub profile included' : 'Portfolio link included');
  }

  // ── 3. Ownership language ──────────────────────────────────────────────────
  const ownershipCount = OWNERSHIP_VERBS.filter(v =>
    new RegExp(`\\b${v}\\b`, 'i').test(text)
  ).length;

  signals.push({
    id: 'ownership_language',
    category: 'Ownership',
    label: 'Ownership & Accountability Language',
    status: ownershipCount >= 4 ? 'STRONG' : ownershipCount >= 2 ? 'NEUTRAL' : 'WEAK',
    evidence: ownershipCount > 0
      ? `Found ownership verbs: ${OWNERSHIP_VERBS.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(text)).slice(0, 4).join(', ')}`
      : 'No strong ownership verbs detected.',
    impact: 'Ownership language signals leadership potential and career maturity.',
  });

  if (ownershipCount >= 4) strengths.push('Strong ownership language throughout');
  else if (ownershipCount < 2) weaknesses.push('Lacks ownership and accountability language');

  // ── 4. Credential signals ──────────────────────────────────────────────────
  const foundCredentials: string[] = [];
  for (const { pattern, label } of CREDENTIAL_SIGNALS) {
    if (pattern.test(text)) foundCredentials.push(label);
  }

  if (foundCredentials.length > 0) {
    signals.push({
      id: 'credentials',
      category: 'Credibility',
      label: 'Credibility Signals',
      status: 'STRONG',
      evidence: `Found: ${foundCredentials.join(', ')}`,
      impact: 'Brand names and certifications increase recruiter trust and engagement.',
    });
    strengths.push(`Credibility signals: ${foundCredentials.slice(0, 2).join(', ')}`);
  }

  // ── 5. Career progression ──────────────────────────────────────────────────
  const hasProgression = PROGRESSION_PATTERNS.some(p => p.test(text));
  const hasMultipleRoles = (text.match(/\b(202[0-9]|201[0-9])\s*[-–—]/g) ?? []).length >= 2;

  signals.push({
    id: 'career_progression',
    category: 'Progression',
    label: 'Career Progression',
    status: hasProgression ? 'STRONG' : hasMultipleRoles ? 'NEUTRAL' : 'WEAK',
    evidence: hasProgression
      ? 'Career progression (promotion pattern) detected.'
      : hasMultipleRoles
      ? 'Multiple roles detected — progression not clearly visible.'
      : 'Career history is not clearly structured.',
    impact: 'Recruiters look for upward mobility as a proxy for high performance.',
  });

  if (hasProgression) strengths.push('Clear career progression is visible');

  // ── 6. Summary / Narrative ────────────────────────────────────────────────
  const hasSummary = parsed.sections.some(s => s.type === 'summary');
  signals.push({
    id: 'narrative',
    category: 'First Impression',
    label: 'Professional Narrative',
    status: hasSummary ? 'STRONG' : 'WEAK',
    evidence: hasSummary
      ? 'Professional summary section detected.'
      : 'No professional summary found.',
    impact: 'A strong summary frames who you are before a recruiter reads a single bullet.',
  });
  if (!hasSummary) weaknesses.push('No professional summary to frame your narrative');

  // ── 7. Formatting consistency ─────────────────────────────────────────────
  const hasSpecialCharIssue = parsed.hasSpecialCharBlocks || parsed.hasTable;
  signals.push({
    id: 'formatting',
    category: 'Formatting',
    label: 'Visual Formatting',
    status: hasSpecialCharIssue ? 'WEAK' : parsed.hasMultiColumn ? 'NEUTRAL' : 'STRONG',
    evidence: hasSpecialCharIssue
      ? 'Special characters or tables detected — may appear garbled.'
      : parsed.hasMultiColumn
      ? 'Two-column layout detected.'
      : 'Clean, standard formatting detected.',
    impact: 'Formatting issues are the first thing a recruiter notices. Clean > fancy.',
  });

  if (!hasSpecialCharIssue && !parsed.hasMultiColumn) {
    strengths.push('Clean formatting — no table or special character issues');
  }

  // ── Score calculation ─────────────────────────────────────────────────────
  const strongSignals = signals.filter(s => s.status === 'STRONG').length;
  const weakSignals = signals.filter(s => s.status === 'WEAK').length;
  const total = signals.length;

  const recruiterScore = Math.round(
    Math.max(0, Math.min(100,
      ((strongSignals * 100) + (signals.filter(s => s.status === 'NEUTRAL').length * 60)) / total
      - (weakSignals * 5)
    ))
  );

  const firstImpressionRating =
    recruiterScore >= 85 ? 'EXCELLENT' :
    recruiterScore >= 70 ? 'GOOD' :
    recruiterScore >= 50 ? 'AVERAGE' : 'POOR';

  const summary = `Recruiter Readiness: ${recruiterScore}/100 — ${firstImpressionRating.toLowerCase()}. `
    + (strengths.length > 0 ? `Strengths: ${strengths.slice(0, 2).join(', ')}.` : '')
    + (weaknesses.length > 0 ? ` Key gap: ${weaknesses[0]}.` : '');

  return {
    recruiterScore,
    signals,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 3),
    summary,
    firstImpressionRating,
  };
}
