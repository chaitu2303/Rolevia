/**
 * Rolevia Bullet Analyzer
 * Analyzes every bullet point individually.
 * Never fabricates numbers, technologies, or achievements.
 */

import weakVerbsData from '@/data/ats_datasets/weak_verbs.json';

const WEAK_VERBS: string[] = weakVerbsData.weakVerbs;
const STRONG_ALTERNATIVES: Record<string, string[]> = weakVerbsData.strongAlternatives;

// Strong action verbs
const STRONG_VERBS = [
  'led', 'managed', 'developed', 'designed', 'built', 'created', 'implemented',
  'launched', 'delivered', 'optimized', 'reduced', 'increased', 'improved',
  'achieved', 'exceeded', 'spearheaded', 'engineered', 'architected', 'deployed',
  'analyzed', 'established', 'generated', 'drove', 'streamlined', 'automated',
  'mentored', 'trained', 'supervised', 'directed', 'owned', 'scaled', 'accelerated',
  'transformed', 'migrated', 'refactored', 'audited', 'researched', 'integrated',
  'collaborated', 'coordinated', 'produced', 'executed', 'expanded', 'secured',
  'negotiated', 'resolved', 'prevented', 'identified', 'tracked', 'modeled',
  'designed', 'prototyped', 'tested', 'validated', 'shipped', 'released',
];

// Quantification patterns (evidence of impact)
const QUANT_PATTERNS: RegExp[] = [
  /\d+\s*%/,           // 40%
  /\$[\d,]+/,          // $50,000
  /\d+\s*x\b/,         // 3x
  /\d+\+?\s*(users|customers|clients|engineers|employees|team members|projects|countries|regions)/i,
  /\d+\+?\s*(ms|seconds|minutes|hours|days|weeks|months|years)/i,
  /reduced.{0,30}\d+/i,
  /increased.{0,30}\d+/i,
  /improved.{0,30}\d+/i,
  /saved.{0,30}\$?\d+/i,
  /\d+\s*(points|pp|bps|fps)/i,
  /\d+[,\d]*\s*(records|requests|queries|rows|transactions)/i,
];

export interface BulletIssue {
  type: string;
  description: string;
  evidence: string;
}

export interface BulletSuggestion {
  type: 'ADD_METRIC' | 'STRENGTHEN_VERB' | 'ADD_TECHNOLOGY' | 'ADD_RESULT' | 'REDUCE_LENGTH' | 'ADD_SPECIFICITY';
  description: string;
  example?: string;  // Never fabricated — structural template only
}

export interface BulletAnalysis {
  originalText: string;
  wordCount: number;
  impactScore: number;        // 0–100
  clarityScore: number;       // 0–100
  specificityScore: number;   // 0–100
  actionStrength: number;     // 0–100
  quantificationScore: number;// 0–100
  overallScore: number;       // 0–100 weighted average
  hasQuantification: boolean;
  weakVerb: string | null;
  suggestedVerb: string | null;
  issues: BulletIssue[];
  suggestions: BulletSuggestion[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFirstWord(text: string): string {
  return text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? '';
}

function hasQuantification(text: string): boolean {
  return QUANT_PATTERNS.some(p => p.test(text));
}

function getActionStrength(text: string): { score: number; weakVerb: string | null; suggestedVerb: string | null } {
  const firstWord = getFirstWord(text);

  // Check for weak verb
  const foundWeak = WEAK_VERBS.find(v => firstWord === v.split(' ')[0] || text.toLowerCase().startsWith(v));
  if (foundWeak) {
    const alts = STRONG_ALTERNATIVES[foundWeak as keyof typeof STRONG_ALTERNATIVES];
    return {
      score: 20,
      weakVerb: foundWeak,
      suggestedVerb: alts?.[0] ?? null,
    };
  }

  // Check for strong verb
  if (STRONG_VERBS.includes(firstWord)) {
    return { score: 100, weakVerb: null, suggestedVerb: null };
  }

  // Semi-strong: starts with some verb-like word
  if (/^[a-z]+ed$/i.test(firstWord) || /^[a-z]+ing$/i.test(firstWord)) {
    return { score: 60, weakVerb: null, suggestedVerb: null };
  }

  // Doesn't start with a verb at all
  return { score: 30, weakVerb: null, suggestedVerb: null };
}

function getClarityScore(text: string): number {
  const words = text.trim().split(/\s+/).length;
  if (words < 5) return 20;  // Too short to be clear
  if (words > 50) return 40; // Too long, hard to read
  if (words > 35) return 60;
  if (words < 8) return 60;
  return 85;
}

function getSpecificityScore(text: string): number {
  let score = 50;
  // Has technology mention
  if (/\b(python|javascript|react|aws|java|node|docker|sql|typescript|go|rust|kubernetes|api|database)\b/i.test(text)) {
    score += 20;
  }
  // Has a measurable noun
  if (/\b(system|platform|feature|module|pipeline|service|application|tool|product|dashboard|api|workflow|process)\b/i.test(text)) {
    score += 15;
  }
  // Generic words reduce specificity
  if (/\b(various|multiple|several|different|many|some|things|stuff)\b/i.test(text)) {
    score -= 20;
  }
  return Math.max(0, Math.min(100, score));
}

// ── Main Analyzer ─────────────────────────────────────────────────────────────

export function analyzeBullet(bulletText: string): BulletAnalysis {
  const text = bulletText.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const issues: BulletIssue[] = [];
  const suggestions: BulletSuggestion[] = [];

  const quant = hasQuantification(text);
  const { score: actionStrength, weakVerb, suggestedVerb } = getActionStrength(text);
  const clarityScore = getClarityScore(text);
  const specificityScore = getSpecificityScore(text);
  const quantificationScore = quant ? 100 : 0;

  // ── Issues ─────────────────────────────────────────────────────────────────

  if (!quant) {
    issues.push({
      type: 'NO_QUANTIFICATION',
      description: 'No measurable result or metric found.',
      evidence: 'Missing: %, $, user count, time, scale, or performance metric.',
    });
    suggestions.push({
      type: 'ADD_METRIC',
      description: 'Add a real metric if available (e.g., reduced load time by 40%, served 10,000+ users).',
      // No fabricated example — user must supply their own numbers
    });
  }

  if (weakVerb) {
    issues.push({
      type: 'WEAK_VERB',
      description: `Starts with a weak verb: "${weakVerb}".`,
      evidence: `"${text.substring(0, 50)}..."`,
    });
    if (suggestedVerb) {
      suggestions.push({
        type: 'STRENGTHEN_VERB',
        description: `Replace "${weakVerb}" with a stronger action verb like "${suggestedVerb}".`,
        example: text.replace(new RegExp(`^${weakVerb}`, 'i'), suggestedVerb),
      });
    }
  }

  if (wordCount > 45) {
    issues.push({
      type: 'TOO_LONG',
      description: `Bullet is ${wordCount} words — too long for easy scanning.`,
      evidence: `Target: 15–30 words for experience bullets.`,
    });
    suggestions.push({
      type: 'REDUCE_LENGTH',
      description: `Reduce from ${wordCount} words to approximately 15–30 words. Cut filler phrases.`,
    });
  }

  if (wordCount < 6) {
    issues.push({
      type: 'TOO_SHORT',
      description: 'Bullet is too brief to convey meaningful impact.',
      evidence: `"${text}" — needs more context.`,
    });
    suggestions.push({
      type: 'ADD_SPECIFICITY',
      description: 'Expand with: what you built/did + what technology/method + what result.',
    });
  }

  if (specificityScore < 40) {
    issues.push({
      type: 'LOW_SPECIFICITY',
      description: 'Bullet lacks specific technologies, systems, or concrete nouns.',
      evidence: 'Generic description without specific tools or outcomes.',
    });
    suggestions.push({
      type: 'ADD_TECHNOLOGY',
      description: 'Name the specific technology, tool, or system you used.',
    });
  }

  if (!quant && actionStrength < 50) {
    suggestions.push({
      type: 'ADD_RESULT',
      description: 'Complete the STAR structure: [Action] + [Technology/Method] + [Result]. Add what outcome your work achieved.',
    });
  }

  // ── Scores ─────────────────────────────────────────────────────────────────

  const impactScore = Math.round(
    (quantificationScore * 0.5) + (actionStrength * 0.3) + (specificityScore * 0.2)
  );

  const overallScore = Math.round(
    (impactScore * 0.35) +
    (clarityScore * 0.25) +
    (specificityScore * 0.25) +
    (actionStrength * 0.15)
  );

  return {
    originalText: text,
    wordCount,
    impactScore,
    clarityScore,
    specificityScore,
    actionStrength,
    quantificationScore,
    overallScore,
    hasQuantification: quant,
    weakVerb,
    suggestedVerb,
    issues,
    suggestions,
  };
}

export function analyzeBullets(bullets: string[]): BulletAnalysis[] {
  return bullets.map(analyzeBullet);
}

export function getBulletsSummary(analyses: BulletAnalysis[]): {
  avgScore: number;
  quantifiedCount: number;
  weakVerbCount: number;
  strongBullets: number;
  poorBullets: number;
} {
  if (analyses.length === 0) {
    return { avgScore: 0, quantifiedCount: 0, weakVerbCount: 0, strongBullets: 0, poorBullets: 0 };
  }
  const avgScore = Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length);
  const quantifiedCount = analyses.filter(a => a.hasQuantification).length;
  const weakVerbCount = analyses.filter(a => a.weakVerb !== null).length;
  const strongBullets = analyses.filter(a => a.overallScore >= 70).length;
  const poorBullets = analyses.filter(a => a.overallScore < 40).length;
  return { avgScore, quantifiedCount, weakVerbCount, strongBullets, poorBullets };
}
