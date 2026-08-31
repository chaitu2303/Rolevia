/**
 * Rolevia Impact Engine
 * Measures the evidence strength, quantification, and overall impact of the resume.
 * Never fabricates metrics. If numbers are missing — says so clearly.
 */

import type { ParsedResume } from './ResumeParser';
import { analyzeBullets, getBulletsSummary } from './BulletAnalyzer';

export interface ImpactResult {
  impactScore: number;           // 0–100
  quantifiedBullets: number;
  totalBullets: number;
  quantificationRate: number;    // 0–100 percentage
  avgBulletScore: number;        // 0–100
  strongBullets: number;
  poorBullets: number;
  bulletAnalyses: ReturnType<typeof analyzeBullets>;
  checks: ImpactCheck[];
  strengths: string[];
  summary: string;
}

export interface ImpactCheck {
  id: string;
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  recommendation: string;
  scoreImpact: number;
}

const IMPACT_METRICS = [
  { pattern: /\d+\s*%/, label: 'Percentage improvement' },
  { pattern: /\$[\d,]+/, label: 'Dollar value / revenue' },
  { pattern: /\d+[kKmMbB]\b/, label: 'Scale metric (K/M/B)' },
  { pattern: /\d+\+?\s*(users|customers|clients|engineers|employees|team members)/i, label: 'People/scale metric' },
  { pattern: /\d+\s*x\b/, label: 'Multiplier metric' },
  { pattern: /reduced.{0,30}\d+/i, label: 'Reduction metric' },
  { pattern: /increased.{0,30}\d+/i, label: 'Growth metric' },
  { pattern: /saved.{0,30}\$?\d+/i, label: 'Savings metric' },
];

export function analyzeImpact(parsed: ParsedResume): ImpactResult {
  const checks: ImpactCheck[] = [];
  const strengths: string[] = [];
  let scoreBase = 100;

  // Collect all experience and project bullets
  const experienceBullets = parsed.sections
    .filter(s => ['experience', 'projects'].includes(s.type))
    .flatMap(s => s.bullets);

  const bulletAnalyses = analyzeBullets(experienceBullets);
  const summary = getBulletsSummary(bulletAnalyses);

  const totalBullets = experienceBullets.length;
  const quantifiedBullets = summary.quantifiedCount;
  const quantificationRate = totalBullets > 0
    ? Math.round((quantifiedBullets / totalBullets) * 100)
    : 0;

  // ── Check: Quantification rate ────────────────────────────────────────────
  if (totalBullets === 0) {
    checks.push({
      id: 'no_bullets',
      label: 'No Bullet Points Found',
      status: 'FAIL',
      severity: 'CRITICAL',
      evidence: 'No experience or project bullets detected in resume.',
      recommendation: 'Add at least 3 bullet points per role describing your responsibilities and achievements.',
      scoreImpact: -30,
    });
    scoreBase -= 30;
  } else if (quantificationRate === 0) {
    checks.push({
      id: 'zero_quantification',
      label: 'No Quantified Achievements',
      status: 'FAIL',
      severity: 'CRITICAL',
      evidence: `0 of ${totalBullets} bullets contain measurable results (%, $, scale, time).`,
      recommendation: 'Add real metrics to your best 3–5 bullets. Ask yourself: by how much? for how many users? how much did it save? Do NOT invent numbers — only use real ones.',
      scoreImpact: -30,
    });
    scoreBase -= 30;
  } else if (quantificationRate < 30) {
    checks.push({
      id: 'low_quantification',
      label: 'Low Quantification Rate',
      status: 'WARN',
      severity: 'HIGH',
      evidence: `Only ${quantifiedBullets} of ${totalBullets} bullets (${quantificationRate}%) have measurable results.`,
      recommendation: 'Aim for at least 40–60% of your bullets to have metrics. Add numbers to your top 3 most impactful achievements.',
      scoreImpact: -15,
    });
    scoreBase -= 15;
  } else {
    checks.push({
      id: 'quantification_rate',
      label: 'Quantification Rate',
      status: quantificationRate >= 50 ? 'PASS' : 'WARN',
      severity: 'MEDIUM',
      evidence: `${quantifiedBullets} of ${totalBullets} bullets (${quantificationRate}%) have metrics.`,
      recommendation: quantificationRate < 50 ? 'Try to add metrics to more bullets.' : '',
      scoreImpact: 0,
    });
    strengths.push(`${quantifiedBullets} of ${totalBullets} bullets include quantified impact`);
  }

  // ── Check: Average bullet score ───────────────────────────────────────────
  if (summary.avgScore < 40 && totalBullets > 0) {
    checks.push({
      id: 'low_avg_bullet_score',
      label: 'Bullet Point Quality',
      status: 'WARN',
      severity: 'HIGH',
      evidence: `Average bullet impact score: ${summary.avgScore}/100. ${summary.poorBullets} of ${totalBullets} bullets score below 40.`,
      recommendation: 'Focus on rewriting your lowest-scoring bullets first. Use the format: [Verb] + [What] + [Technology] + [Result].',
      scoreImpact: -10,
    });
    scoreBase -= 10;
  } else if (totalBullets > 0 && summary.avgScore >= 65) {
    strengths.push(`Strong average bullet impact score: ${summary.avgScore}/100`);
  }

  // ── Check: Weak verbs ─────────────────────────────────────────────────────
  if (summary.weakVerbCount > 2) {
    checks.push({
      id: 'weak_verbs',
      label: 'Weak Action Verbs',
      status: 'WARN',
      severity: 'MEDIUM',
      evidence: `${summary.weakVerbCount} bullets start with weak verbs (helped, worked, assisted, etc.).`,
      recommendation: 'Replace weak verbs with strong action verbs: Led, Built, Engineered, Deployed, Optimized, Reduced, Improved, Launched.',
      scoreImpact: -8,
    });
    scoreBase -= 8;
  } else if (totalBullets > 0) {
    strengths.push('Strong action verbs dominate experience bullets');
  }

  // ── Check: Strong bullets ─────────────────────────────────────────────────
  if (summary.strongBullets > 0) {
    strengths.push(`${summary.strongBullets} of ${totalBullets} bullets score 70+ (strong)`);
  }

  // ── Detect specific impact metrics in full text ───────────────────────────
  const text = parsed.rawText;
  const foundMetrics: string[] = [];
  for (const { pattern, label } of IMPACT_METRICS) {
    if (pattern.test(text)) foundMetrics.push(label);
  }

  if (foundMetrics.length > 0) {
    strengths.push(`Impact metrics found: ${foundMetrics.slice(0, 3).join(', ')}`);
  }

  const impactScore = Math.max(0, Math.min(100, scoreBase));

  const impactSummary = impactScore >= 80
    ? `Impact evidence is strong (${impactScore}/100). Your resume demonstrates measurable achievements.`
    : impactScore >= 55
    ? `Impact evidence is moderate (${impactScore}/100). Adding more metrics will significantly improve your score.`
    : `Impact evidence is weak (${impactScore}/100). Most bullets lack measurable outcomes. This is the #1 differentiator in competitive applications.`;

  return {
    impactScore,
    quantifiedBullets,
    totalBullets,
    quantificationRate,
    avgBulletScore: summary.avgScore,
    strongBullets: summary.strongBullets,
    poorBullets: summary.poorBullets,
    bulletAnalyses,
    checks,
    strengths,
    summary: impactSummary,
  };
}
