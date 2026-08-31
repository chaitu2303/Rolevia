/**
 * Rolevia Keyword Engine
 * Compares resume keywords against job description.
 * Never recommends adding a skill the user doesn't have.
 * All matches are evidence-traced to actual resume text.
 */

import skillsData from '@/data/ats_datasets/skills_taxonomy.json';

const ALL_SKILLS = new Set(skillsData.skills.map(s => s.toLowerCase()));
const SKILL_ALIASES: Record<string, string> = skillsData.aliases;

export type KeywordStatus = 'FOUND' | 'PARTIAL' | 'MISSING';

export interface KeywordMatch {
  keyword: string;
  status: KeywordStatus;
  importance: 'REQUIRED' | 'PREFERRED' | 'DOMAIN';
  evidence: string | null;   // Quote from resume where found — null if missing
  resumeSection: string | null; // Which section it was found in
}

export interface KeywordResult {
  matchScore: number;         // 0–100
  totalKeywords: number;
  foundKeywords: number;
  partialKeywords: number;
  missingKeywords: number;
  keywordMatches: KeywordMatch[];
  overrepresentedKeywords: string[];  // Keywords repeated too many times
  summary: string;
}

// ── JD Keyword Extraction ─────────────────────────────────────────────────────

function normalizeSkill(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return SKILL_ALIASES[lower] ?? lower;
}

function extractJdKeywords(jdText: string): { required: string[]; preferred: string[]; domain: string[] } {
  const text = jdText;
  const lower = text.toLowerCase();

  // Find "Required" / "Must have" block vs "Preferred" / "Nice to have" block
  const requiredSection = text.match(/(?:required|must\s+have|minimum\s+qualifications?|requirements?)[:\s]*([^]*?)(?=(?:preferred|nice\s+to\s+have|bonus|$))/i)?.[1] ?? '';
  const preferredSection = text.match(/(?:preferred|nice\s+to\s+have|bonus|plus)[:\s]*([^]*?)(?=\n\n|$)/i)?.[1] ?? '';

  const extractFromBlock = (block: string): string[] => {
    const words = block.toLowerCase().replace(/[^a-z0-9#\+\.\s]/g, ' ').split(/\s+/);
    const found = new Set<string>();

    for (let i = 0; i < words.length; i++) {
      const w1 = normalizeSkill(words[i]);
      if (ALL_SKILLS.has(w1) && w1.length > 1) found.add(w1);

      if (i < words.length - 1) {
        const w2 = normalizeSkill(`${words[i]} ${words[i + 1]}`);
        if (ALL_SKILLS.has(w2)) found.add(w2);
      }

      if (i < words.length - 2) {
        const w3 = normalizeSkill(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        if (ALL_SKILLS.has(w3)) found.add(w3);
      }
    }
    return Array.from(found);
  };

  const required = extractFromBlock(requiredSection || text);
  const preferred = extractFromBlock(preferredSection).filter(k => !required.includes(k));
  const domain = extractFromBlock(lower)
    .filter(k => !required.includes(k) && !preferred.includes(k))
    .slice(0, 10);

  return { required, preferred, domain };
}

// ── Resume Keyword Search with Evidence ──────────────────────────────────────

function findKeywordInResume(
  keyword: string,
  parsed: { sections: Array<{ type: string; content: string }> }
): { found: boolean; partial: boolean; evidence: string | null; section: string | null } {
  const kw = keyword.toLowerCase();
  const normalized = normalizeSkill(kw);
  const aliases = Object.entries(SKILL_ALIASES)
    .filter(([, v]) => v === normalized)
    .map(([k]) => k);

  const searchTerms = [normalized, kw, ...aliases];

  for (const section of parsed.sections) {
    const sectionLower = section.content.toLowerCase();

    for (const term of searchTerms) {
      // Exact word boundary match
      const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(sectionLower)) {
        // Extract evidence snippet (surrounding words)
        const match = sectionLower.match(re);
        if (match && match.index !== undefined) {
          const start = Math.max(0, match.index - 40);
          const end = Math.min(section.content.length, match.index + term.length + 40);
          const snippet = '...' + section.content.slice(start, end).trim() + '...';
          return { found: true, partial: false, evidence: snippet, section: section.type };
        }
      }

      // Partial: check if keyword is embedded in a longer word
      if (sectionLower.includes(term) && term.length > 3) {
        return { found: false, partial: true, evidence: `Related term found in ${section.type} section`, section: section.type };
      }
    }
  }

  return { found: false, partial: false, evidence: null, section: null };
}

function detectOverrepresented(jdText: string, resumeText: string): string[] {
  const keywords = Array.from(ALL_SKILLS).filter(k => k.length > 3);
  const overused: string[] = [];
  const resumeLower = resumeText.toLowerCase();

  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = resumeLower.match(re);
    if (matches && matches.length > 6) {
      overused.push(kw);
    }
  }
  return overused.slice(0, 5);
}

// ── Main Engine ───────────────────────────────────────────────────────────────

export function analyzeKeywords(
  parsed: { sections: Array<{ type: string; content: string }>; rawText: string },
  jdText: string
): KeywordResult {
  const { required, preferred, domain } = extractJdKeywords(jdText);

  const allKeywords = [
    ...required.map(k => ({ keyword: k, importance: 'REQUIRED' as const })),
    ...preferred.map(k => ({ keyword: k, importance: 'PREFERRED' as const })),
    ...domain.map(k => ({ keyword: k, importance: 'DOMAIN' as const })),
  ].slice(0, 60); // Cap at 60 keywords for performance

  const keywordMatches: KeywordMatch[] = [];

  for (const { keyword, importance } of allKeywords) {
    const { found, partial, evidence, section } = findKeywordInResume(keyword, parsed);

    keywordMatches.push({
      keyword,
      importance,
      status: found ? 'FOUND' : partial ? 'PARTIAL' : 'MISSING',
      evidence,
      resumeSection: section,
    });
  }

  const foundKeywords = keywordMatches.filter(k => k.status === 'FOUND').length;
  const partialKeywords = keywordMatches.filter(k => k.status === 'PARTIAL').length;
  const missingKeywords = keywordMatches.filter(k => k.status === 'MISSING').length;
  const total = keywordMatches.length || 1;

  // Score: FOUND = full points, PARTIAL = half points, weighted by importance
  let weightedScore = 0;
  let totalWeight = 0;

  for (const match of keywordMatches) {
    const weight = match.importance === 'REQUIRED' ? 3
      : match.importance === 'PREFERRED' ? 2 : 1;
    totalWeight += weight;
    if (match.status === 'FOUND') weightedScore += weight;
    else if (match.status === 'PARTIAL') weightedScore += weight * 0.5;
  }

  const matchScore = totalWeight > 0
    ? Math.round((weightedScore / totalWeight) * 100)
    : 0;

  const overrepresentedKeywords = detectOverrepresented(jdText, parsed.rawText);

  const summary = matchScore >= 80
    ? `Strong keyword alignment (${matchScore}/100). Your resume covers most required skills.`
    : matchScore >= 55
    ? `Moderate keyword alignment (${matchScore}/100). ${missingKeywords} required keyword(s) are missing from your resume.`
    : `Weak keyword alignment (${matchScore}/100). ${missingKeywords} important keywords from the job description are absent. This is a critical gap.`;

  return {
    matchScore,
    totalKeywords: total,
    foundKeywords,
    partialKeywords,
    missingKeywords,
    keywordMatches,
    overrepresentedKeywords,
    summary,
  };
}
