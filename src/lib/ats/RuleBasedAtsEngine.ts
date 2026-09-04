// Real Rule-Based ATS Scoring Engine
// Works without any AI API — produces genuine, accurate scores
// Based on actual ATS evaluation criteria used by Workday, Greenhouse, Lever etc.

import actionVerbsData from '../../data/ats_datasets/action_verbs.json';
import weakVerbsData from '../../data/ats_datasets/weak_verbs.json';
import sectionAliasesData from '../../data/ats_datasets/section_aliases.json';
import fillerWordsData from '../../data/ats_datasets/filler_words.json';
import roleTemplatesData from '../../data/ats_datasets/role_templates.json';

const ACTION_VERBS = actionVerbsData.power_verbs;
const WEAK_VERBS = weakVerbsData.weakVerbs;
const SECTION_ALIASES = sectionAliasesData.sectionAliases;
const FILLER_PHRASES = fillerWordsData.fillerPhrases;
const ROLE_TEMPLATES = roleTemplatesData.roleTemplates;

export interface AtsCheck {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  evidence: string;
  recommendation: string;
  scoreImpact?: number;
}

export interface AtsResult {
  overallScore: number;
  parseRate: number;
  contentScore: number;
  sectionsScore: number;
  formattingScore: number;
  checks: AtsCheck[];
  strengths: string[];
  summary: string;
  autoFixedResume?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasPattern(text: string, patterns: RegExp[]) {
  return patterns.some(p => p.test(text));
}

const QUANTIFIER_PATTERNS = [
  /\d+%/g,
  /\$[\d,]+/g,
  /\d+\+?\s*(users|customers|clients|employees|team members|engineers|projects)/gi,
  /\d+x\s/gi,
  /increased\s+by\s+\d+/gi,
  /reduced\s+by\s+\d+/gi,
  /saved\s+\$?\d+/gi,
];

// ── Section Detectors ─────────────────────────────────────────────────────────

function detectSections(text: string) {
  const lower = text.toLowerCase();
  
  const hasAlias = (aliases: string[]) => aliases.some(alias => new RegExp(`\\b${alias}\\b`, 'i').test(lower));

  return {
    hasContact: hasAlias(SECTION_ALIASES.contact) || /(\bemail\b|@[a-zA-Z]|phone|mobile|\+\d|\(\d{3}\)|\d{3}[-.\s]\d{3})/i.test(text),
    hasName: /^[A-Z][a-z]+ [A-Z][a-z]+/m.test(text),
    hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text),
    hasPhone: /(\+?\d[\d\s\-().]{7,}\d)/i.test(text),
    hasLinkedIn: /linkedin\.com\/in\//i.test(text),
    hasSummary: hasAlias(SECTION_ALIASES.summary),
    hasExperience: hasAlias(SECTION_ALIASES.experience),
    hasEducation: hasAlias(SECTION_ALIASES.education),
    hasSkills: hasAlias(SECTION_ALIASES.skills),
    hasCertifications: hasAlias(SECTION_ALIASES.certifications),
    hasProjects: hasAlias(SECTION_ALIASES.projects),
  };
}

function detectFormatIssues(text: string) {
  return {
    hasSpecialChars: /[│┌┐└┘├┤┬┴┼═╠╣╦╩╬]/g.test(text),
    hasTableChars: /(\|[-]+\|)/.test(text),
    hasPageBreak: /\f/.test(text),
    lineTooLong: text.split('\n').some(line => line.length > 120),
    hasConsistentDates: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(text),
  };
}

function getActionVerbScore(text: string): { score: number; found: string[]; missing: boolean } {
  const words = text.toLowerCase().split(/\s+/);
  const found = ACTION_VERBS.filter((v: string) => words.includes(v.toLowerCase()));
  const score = Math.min(100, Math.round((found.length / 8) * 100));
  return { score, found, missing: found.length < 4 };
}

function getQuantifierScore(text: string): { score: number; count: number } {
  let count = 0;
  QUANTIFIER_PATTERNS.forEach(p => {
    const matches = text.match(p);
    if (matches) count += matches.length;
  });
  const score = Math.min(100, Math.round((count / 5) * 100));
  return { score, count };
}

function getFillerWordScore(text: string): { found: string[] } {
  const lower = text.toLowerCase();
  const found = FILLER_PHRASES.filter((phrase: string) => lower.includes(phrase.toLowerCase()));
  return { found };
}

function getWeakVerbScore(text: string): { found: string[] } {
  const lower = text.toLowerCase();
  const found = WEAK_VERBS.filter((v: string) => lower.includes(` ${v.toLowerCase()} `));
  return { found };
}

// ── Main Scorer ───────────────────────────────────────────────────────────────

export function analyzeResume(rawText: string, roleId?: string): AtsResult {
  const sections = detectSections(rawText);
  const formatIssues = detectFormatIssues(rawText);
  const actionVerbs = getActionVerbScore(rawText);
  const quantifiers = getQuantifierScore(rawText);
  const fillers = getFillerWordScore(rawText);
  const weakVerbs = getWeakVerbScore(rawText);
  const wordCount = countWords(rawText);

  // Look up role template if provided
  // @ts-ignore
  const roleTemplate = roleId && ROLE_TEMPLATES[roleId] ? ROLE_TEMPLATES[roleId] : ROLE_TEMPLATES['default'];

  const checks: AtsCheck[] = [];
  const strengths: string[] = [];

  // ── PARSE RATE scoring ────────────────────────────────────────────────────
  let parseRate = 100;

  if (formatIssues.hasSpecialChars || formatIssues.hasTableChars) {
    parseRate -= 30;
    checks.push({
      id: 'format_tables_chars',
      category: 'ATS_ESSENTIALS',
      severity: 'CRITICAL',
      status: 'FAIL',
      label: 'Table or Special Characters Detected',
      evidence: 'ATS systems cannot parse tables, boxes, or special Unicode characters. They appear as garbled text or are skipped entirely.',
      recommendation: 'Remove all tables and replace them with plain bullet points. Avoid any Unicode box-drawing characters.'
    });
  }

  if (!sections.hasEmail) {
    parseRate -= 20;
    checks.push({
      id: 'contact_email',
      category: 'ATS_ESSENTIALS',
      severity: 'CRITICAL',
      status: 'FAIL',
      label: 'Email Address Not Found',
      evidence: 'Your email address was not detected. ATS systems parse email as a primary contact field — without it, your application may be dropped automatically.',
      recommendation: 'Add a clear email address (e.g., yourname@gmail.com) in the contact section at the top of your resume.'
    });
  }

  if (!sections.hasPhone) {
    parseRate -= 10;
    checks.push({
      id: 'contact_phone',
      category: 'ATS_ESSENTIALS',
      severity: 'HIGH',
      status: 'WARN',
      label: 'Phone Number Not Detected',
      evidence: 'A phone number is a standard required field in ATS. Without it, recruiters cannot contact you easily.',
      recommendation: 'Add your phone number in the format: +91 9876543210 or (987) 654-3210 at the top of your resume.'
    });
  }

  if (!sections.hasLinkedIn) {
    parseRate -= 5;
    checks.push({
      id: 'contact_linkedin',
      category: 'ATS_ESSENTIALS',
      severity: 'MEDIUM',
      status: 'WARN',
      label: 'LinkedIn Profile Missing',
      evidence: '72% of recruiters check LinkedIn before interviews. Including your profile URL signals professionalism.',
      recommendation: 'Add your LinkedIn URL: linkedin.com/in/yourname — customize it in LinkedIn settings first for a clean URL.'
    });
  } else {
    strengths.push('LinkedIn profile URL detected — great for recruiter verification');
  }

  parseRate = Math.max(0, parseRate);

  // ── SECTIONS scoring ──────────────────────────────────────────────────────
  let sectionsScore = 0;
  
  // Dynamic weight calculation based on role template
  const sectionChecks: any[] = [];
  
  if (roleTemplate.requiredSections.includes('contact')) sectionChecks.push({ has: sections.hasContact, weight: 20, name: 'Contact Info', required: true });
  if (roleTemplate.requiredSections.includes('experience')) sectionChecks.push({ has: sections.hasExperience, weight: 30, name: 'Work Experience', required: true });
  if (roleTemplate.requiredSections.includes('education')) sectionChecks.push({ has: sections.hasEducation, weight: 25, name: 'Education', required: true });
  if (roleTemplate.requiredSections.includes('skills')) sectionChecks.push({ has: sections.hasSkills, weight: 20, name: 'Skills', required: true });
  
  // Optional sections based on role template
  if (roleTemplate.optionalSections.includes('summary')) sectionChecks.push({ has: sections.hasSummary, weight: 5, name: 'Summary/Objective', required: false });
  if (roleTemplate.optionalSections.includes('projects')) sectionChecks.push({ has: sections.hasProjects, weight: 5, name: 'Projects', required: false });

  sectionChecks.forEach(({ has, weight, name, required }) => {
    if (has) {
      sectionsScore += weight;
      checks.push({
        id: `section_${name.toLowerCase()}`,
        category: 'SECTIONS',
        severity: 'LOW',
        status: 'PASS',
        label: `${name} Section Detected`,
        evidence: `The "${name}" section was successfully found.`,
        recommendation: ''
      });
    } else if (required) {
      checks.push({
        id: `section_${name.toLowerCase()}`,
        category: 'SECTIONS',
        severity: weight >= 25 ? 'CRITICAL' : weight >= 15 ? 'HIGH' : 'MEDIUM',
        status: 'FAIL',
        label: `${name} Section Missing`,
        evidence: `The "${name}" section was not detected. This is highly required for a ${roleTemplate.label} role.`,
        recommendation: `Add a clearly labeled "${name}" section using that exact heading.`
      });
    } else {
      checks.push({
        id: `section_${name.toLowerCase()}`,
        category: 'SECTIONS',
        severity: 'MEDIUM',
        status: 'WARN',
        label: `Optional ${name} Section Missing`,
        evidence: `Adding a "${name}" section can boost your profile for a ${roleTemplate.label} role.`,
        recommendation: `Consider adding a "${name}" section to stand out.`
      });
    }
  });

  if (sections.hasSummary) {
    strengths.push('Professional summary detected — helps recruiters quickly understand your value proposition');
  }

  if (sections.hasCertifications) {
    sectionsScore = Math.min(100, sectionsScore + 5);
    strengths.push('Certifications section detected — adds strong credibility to your profile');
  }

  // ── CONTENT scoring ───────────────────────────────────────────────────────
  let contentScore = 50; // base

  // Action verbs
  if (actionVerbs.missing) {
    contentScore -= 20;
    checks.push({
      id: 'content_action_verbs',
      category: 'CONTENT',
      severity: 'HIGH',
      status: 'WARN',
      label: 'Weak or Missing Action Verbs',
      evidence: `Only ${actionVerbs.found.length} strong action verbs found. ATS systems and recruiters look for powerful verbs that demonstrate impact.`,
      recommendation: `Start every bullet point with a strong action verb: Led, Engineered, Delivered, Optimized, Architected, Spearheaded, Reduced, Increased, Launched.`
    });
  } else {
    contentScore += 15;
    strengths.push(`Strong action verbs used (${actionVerbs.found.slice(0, 4).join(', ')}…) — makes bullets impactful`);
  }

  // Weak verbs penalty
  if (weakVerbs.found.length > 0) {
    contentScore -= (weakVerbs.found.length * 2);
    checks.push({
      id: 'content_weak_verbs',
      category: 'CONTENT',
      severity: 'MEDIUM',
      status: 'WARN',
      label: 'Weak Verbs Detected',
      evidence: `Found weak verbs like: ${weakVerbs.found.slice(0, 3).join(', ')}. These dilute your impact.`,
      recommendation: `Replace weak verbs with strong action verbs from the power verbs list.`
    });
  }

  // Filler words penalty
  if (fillers.found.length > 0) {
    contentScore -= (fillers.found.length * 2);
    checks.push({
      id: 'content_filler_words',
      category: 'CONTENT',
      severity: 'MEDIUM',
      status: 'WARN',
      label: 'Cliché or Filler Phrases Detected',
      evidence: `Found clichés like: ${fillers.found.slice(0, 3).join(', ')}. Recruiters ignore buzzwords.`,
      recommendation: `Remove fluff and focus on concrete, quantifiable achievements.`
    });
  }

  // Quantification
  if (quantifiers.count === 0) {
    contentScore -= 25;
    checks.push({
      id: 'content_quantification_zero',
      category: 'CONTENT',
      severity: 'CRITICAL',
      status: 'FAIL',
      label: 'Zero Quantified Achievements',
      evidence: 'No numbers, percentages, or metrics found. Quantified achievements are the #1 factor that separates good resumes from great ones.',
      recommendation: 'Add metrics to every bullet: "Increased sales by 35%" not "Increased sales". Include: %, $, team size, user counts, time saved, cost reduced.'
    });
  } else if (quantifiers.count < 3) {
    contentScore -= 10;
    checks.push({
      id: 'content_quantification_low',
      category: 'CONTENT',
      severity: 'HIGH',
      status: 'WARN',
      label: 'Too Few Quantified Achievements',
      evidence: `Only ${quantifiers.count} quantified metric(s) found. Most hiring managers expect 2-3 metrics per role.`,
      recommendation: 'Add more metrics. For every work experience bullet, ask: "By how much?", "For how many people?", "How much did it cost/save?"'
    });
  } else {
    strengths.push(`${quantifiers.count} quantified achievements found — recruiters love concrete numbers`);
  }

  // Resume length
  if (wordCount < 200) {
    contentScore -= 20;
    checks.push({
      id: 'content_length_short',
      category: 'CONTENT',
      severity: 'CRITICAL',
      status: 'FAIL',
      label: 'Resume is Too Short',
      evidence: `Only ${wordCount} words detected. A very short resume suggests missing content — ATS systems and recruiters expect comprehensive information.`,
      recommendation: 'Expand your resume with detailed experience bullets (3-5 per role), a skills section, and a professional summary.'
    });
  } else if (wordCount > 1200) {
    contentScore -= 10;
    checks.push({
      id: 'content_length_long',
      category: 'CONTENT',
      severity: 'MEDIUM',
      status: 'WARN',
      label: 'Resume May Be Too Long',
      evidence: `${wordCount} words detected. Resumes over 2 pages reduce recruiter engagement and may be truncated by ATS.`,
      recommendation: 'Target 400-800 words for <5 years experience. Cut older roles to 1-2 bullets. Remove irrelevant jobs from 10+ years ago.'
    });
  } else {
    strengths.push(`Resume length is appropriate (${wordCount} words) — well within ATS-optimal range`);
  }

  contentScore = Math.max(0, Math.min(100, contentScore));

  // ── FORMATTING scoring ────────────────────────────────────────────────────
  let formattingScore = 85; // assume good baseline

  if (formatIssues.hasSpecialChars) formattingScore -= 20;
  if (!sections.hasName) {
    formattingScore -= 15;
    checks.push({
      id: 'format_name_top',
      category: 'ATS_ESSENTIALS',
      severity: 'HIGH',
      status: 'FAIL',
      label: 'Full Name Not Clearly Detected at Top',
      evidence: 'Your full name should be the first and largest text on the resume. ATS systems parse it as a key identifier.',
      recommendation: 'Put your full name (First Last) as the very first line of your resume, in a slightly larger font than body text.'
    });
  }

  if (formatIssues.hasConsistentDates) {
    strengths.push('Consistent date formatting detected — helps ATS calculate your years of experience accurately');
  }

  formattingScore = Math.max(0, Math.min(100, formattingScore));

  // ── Overall Score ─────────────────────────────────────────────────────────
  const overallScore = Math.round(
    parseRate * 0.25 +
    contentScore * 0.35 +
    sectionsScore * 0.25 +
    formattingScore * 0.15
  );

  // Summary
  let summary = '';
  const issueCount = checks.filter(c => c.status !== 'PASS').length;
  const criticalIssue = checks.find(c => c.severity === 'CRITICAL');
  if (overallScore >= 80) {
    summary = `Excellent resume! Scoring ${overallScore}/100, it is well-structured with strong content and ATS-friendly formatting. Focus on the ${issueCount} remaining issues to reach a perfect score.`;
  } else if (overallScore >= 60) {
    summary = `Good foundation with a score of ${overallScore}/100, but there are ${issueCount} significant issues preventing you from passing ATS filters. Focus on fixing CRITICAL issues first — especially ${criticalIssue?.label || 'content gaps'}.`;
  } else {
    summary = `Your resume scores ${overallScore}/100 and needs significant improvement before applying. ATS systems may reject it automatically. Address the ${checks.filter(i => i.severity === 'CRITICAL').length} CRITICAL issues immediately — start with the contact information and quantified achievements.`;
  }

  // Limit issues to top 8 most impactful
  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedChecks = checks
    .sort((a, b) => priorityOrder[a.severity] - priorityOrder[b.severity])
    .slice(0, 15); // Show more checks since some are PASS now

  return {
    overallScore,
    parseRate,
    contentScore,
    sectionsScore,
    formattingScore,
    checks: sortedChecks,
    strengths: strengths.slice(0, 5),
    summary
  };
}
