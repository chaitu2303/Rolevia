/**
 * Rolevia Resume Intelligence — Master Orchestrator
 * Coordinates all scoring engines into a single unified analysis.
 *
 * Design principles:
 * - Deterministic: same input = same output every time
 * - Evidence-traced: every finding points to actual resume text
 * - No hallucination: never invents metrics, skills, or achievements
 * - Career-level-aware: scoring adapts to experience level
 */

import { parseResumeText, type ParsedResume } from './ResumeParser';
import { analyzeAtsCompatibility } from './AtsCompatibilityEngine';
import { analyzeContentQuality } from './ContentQualityEngine';
import { analyzeImpact } from './ImpactEngine';
import { analyzeKeywords } from './KeywordEngine';
import { analyzeJobMatch } from './JobMatchEngine';
import { analyzeRecruiterReadiness } from './RecruiterReadinessEngine';
import { scanBiasAndPrivacy } from './BiasPrivacyScanner';
import { buildActionPlan } from './ActionPlanEngine';
import { DEFAULT_WEIGHTS, WEIGHTS_NO_JD, REPORT_VERSION, getScoreLabel, getScoreColor } from './scoring.config';
import type { CareerLevel } from './CareerLevelAdapter';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IntelligenceInput {
  text: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  jobDescriptionText?: string | null;
  targetRole?: string | null;
  targetCompany?: string | null;
  experienceLevel?: CareerLevel | null;
  country?: string | null;
}

export interface IntelligenceReport {
  // Metadata
  reportVersion: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  targetRole: string | null;
  targetCompany: string | null;
  experienceLevel: string | null;
  hasJobDescription: boolean;

  // Extraction info
  extractionStatus: 'SUCCESS' | 'LOW_CONFIDENCE' | 'IMAGE_ONLY' | 'FAILED';
  extractionConfidence: number;
  isImageOnly: boolean;
  wordCount: number;

  // Scores (0–100)
  careerOsScore: number;
  atsScore: number;
  contentScore: number;
  impactScore: number;
  jobMatchScore: number | null;
  recruiterScore: number;
  consistencyScore: number;

  // Score labels
  careerOsLabel: string;
  careerOsColor: 'success' | 'warning' | 'destructive';

  // Detailed results
  parsedSections: ParsedResume['sections'];
  contact: ParsedResume['contact'];
  atsResult: ReturnType<typeof analyzeAtsCompatibility>;
  contentResult: ReturnType<typeof analyzeContentQuality>;
  impactResult: ReturnType<typeof analyzeImpact>;
  keywordResult: ReturnType<typeof analyzeKeywords> | null;
  jobMatchResult: ReturnType<typeof analyzeJobMatch> | null;
  recruiterResult: ReturnType<typeof analyzeRecruiterReadiness>;
  privacyResult: ReturnType<typeof scanBiasAndPrivacy>;
  actionPlan: ReturnType<typeof buildActionPlan>;

  // Summary
  strengths: string[];
  topGaps: string[];
  summary: string;
}

// ── Consistency Score ─────────────────────────────────────────────────────────

function calculateConsistencyScore(parsed: ParsedResume): number {
  let score = 100;

  // Check date format consistency
  const dateFormats = parsed.rawText.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b|\b\d{1,2}\/\d{4}\b|\b\d{4}\b/gi) ?? [];
  const hasMonthYear = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(parsed.rawText);
  const hasNumericDates = /\b\d{1,2}\/\d{4}\b/.test(parsed.rawText);
  if (hasMonthYear && hasNumericDates) score -= 10; // Mixed formats

  // Check bullet consistency
  const bulletMarkers = (parsed.rawText.match(/^[•\-*▪▸◦]/mg) ?? []).length;
  const numberedBullets = (parsed.rawText.match(/^\d+\./mg) ?? []).length;
  if (bulletMarkers > 2 && numberedBullets > 2) score -= 8; // Mixed bullet styles

  // First-person pronouns (should be avoided)
  const firstPerson = (parsed.rawText.match(/\b(I|me|my|mine|myself)\b/g) ?? []).length;
  if (firstPerson > 3) score -= 10;

  // Job-hopping signal (5+ roles in 3 years)
  const yearMatches = parsed.rawText.match(/\b20\d{2}\b/g) ?? [];
  const uniqueYears = new Set(yearMatches).size;
  const roleCount = (parsed.rawText.match(/\b(20[12][0-9])\s*[-–—]/g) ?? []).length;
  if (roleCount > 4 && uniqueYears < 3) score -= 15;

  return Math.max(0, Math.min(100, score));
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────

export async function runResumeIntelligence(input: IntelligenceInput): Promise<IntelligenceReport> {
  const { text, fileName, fileMimeType, fileSizeBytes, jobDescriptionText,
          targetRole, targetCompany, experienceLevel, country } = input;

  // 1. Parse
  const parsed = parseResumeText({ text, fileName, fileMimeType, fileSizeBytes });

  // 2. Determine extraction status
  let extractionStatus: IntelligenceReport['extractionStatus'] = 'SUCCESS';
  if (parsed.isImageOnly) extractionStatus = 'IMAGE_ONLY';
  else if (parsed.extractionConfidence < 30) extractionStatus = 'FAILED';
  else if (parsed.extractionConfidence < 60) extractionStatus = 'LOW_CONFIDENCE';

  const hasJD = !!jobDescriptionText?.trim();

  // 3. Run all engines
  const atsResult = analyzeAtsCompatibility(parsed);
  const contentResult = analyzeContentQuality(parsed, experienceLevel);
  const impactResult = analyzeImpact(parsed);
  const recruiterResult = analyzeRecruiterReadiness(parsed);
  const privacyResult = scanBiasAndPrivacy(parsed);
  const consistencyScore = calculateConsistencyScore(parsed);

  const keywordResult = hasJD
    ? analyzeKeywords({ sections: parsed.sections, rawText: parsed.rawText }, jobDescriptionText!)
    : null;

  const jobMatchResult = hasJD
    ? analyzeJobMatch({ parsed, jdText: jobDescriptionText!, targetRole, experienceLevel })
    : null;

  // 4. Build action plan
  const actionPlan = buildActionPlan({
    atsChecks: atsResult.checks,
    contentChecks: contentResult.checks,
    impactChecks: impactResult.checks,
    recruiterSignals: recruiterResult.signals,
    privacyFlags: privacyResult.flags,
    jobMatchDimensions: jobMatchResult?.dimensions ?? [],
  });

  // 5. Calculate Rolevia composite score
  const weights = hasJD ? DEFAULT_WEIGHTS : WEIGHTS_NO_JD;

  const careerOsScore = Math.round(
    (atsResult.atsScore * weights.atsCompatibility / 100) +
    (contentResult.contentScore * weights.contentQuality / 100) +
    (impactResult.impactScore * weights.impactEvidence / 100) +
    ((keywordResult?.matchScore ?? 0) * weights.jobRelevance / 100) +
    (recruiterResult.recruiterScore * weights.recruiterReadiness / 100) +
    (consistencyScore * weights.consistency / 100)
  );

  // 6. Compile strengths and gaps
  const allStrengths = [
    ...atsResult.strengths,
    ...contentResult.strengths,
    ...impactResult.strengths,
    ...recruiterResult.strengths,
    ...(jobMatchResult?.strengths ?? []),
  ];

  const allGaps = [
    ...actionPlan.items.filter(i => i.priority === 'P0').map(i => i.title),
    ...(jobMatchResult?.gaps ?? []),
  ];

  const summary =
    `Rolevia Score: ${careerOsScore}/100 (${getScoreLabel(careerOsScore)}). ` +
    `ATS: ${atsResult.atsScore} | Content: ${contentResult.contentScore} | Impact: ${impactResult.impactScore}` +
    (hasJD ? ` | Job Match: ${jobMatchResult?.jobMatchScore}` : '') +
    ` | Recruiter: ${recruiterResult.recruiterScore}.`;

  return {
    reportVersion: REPORT_VERSION,
    fileName,
    fileMimeType,
    fileSizeBytes,
    targetRole: targetRole ?? null,
    targetCompany: targetCompany ?? null,
    experienceLevel: experienceLevel ?? null,
    hasJobDescription: hasJD,

    extractionStatus,
    extractionConfidence: parsed.extractionConfidence,
    isImageOnly: parsed.isImageOnly,
    wordCount: parsed.wordCount,

    careerOsScore,
    atsScore: atsResult.atsScore,
    contentScore: contentResult.contentScore,
    impactScore: impactResult.impactScore,
    jobMatchScore: jobMatchResult?.jobMatchScore ?? null,
    recruiterScore: recruiterResult.recruiterScore,
    consistencyScore,

    careerOsLabel: getScoreLabel(careerOsScore),
    careerOsColor: getScoreColor(careerOsScore),

    parsedSections: parsed.sections,
    contact: parsed.contact,
    atsResult,
    contentResult,
    impactResult,
    keywordResult,
    jobMatchResult,
    recruiterResult,
    privacyResult,
    actionPlan,

    strengths: [...new Set(allStrengths)].slice(0, 8),
    topGaps: [...new Set(allGaps)].slice(0, 5),
    summary,
  };
}
