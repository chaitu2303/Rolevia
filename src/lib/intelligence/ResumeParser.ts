/**
 * Rolevia Resume Parser
 * Deterministic text-based parser for PDF and DOCX extracted text.
 * Never fabricates. Never pretends OCR happened on image PDFs.
 */

import sectionAliasesData from '@/data/ats_datasets/section_aliases.json';

export type VerificationState = 'VERIFIED' | 'USER_CONFIRMED' | 'UNCERTAIN';

export interface ParsedSection {
  type: string;        // normalized type: experience | education | skills | etc.
  rawHeading: string;  // original heading text as found in resume
  content: string;     // full text content of section
  bullets: string[];   // extracted bullet points
  confidence: number;  // 0–100
  verificationState?: VerificationState;
}

export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  location: string | null;
  verificationState?: VerificationState;
}

export interface ParsedResume {
  rawText: string;
  wordCount: number;
  lineCount: number;
  charCount: number;
  sections: ParsedSection[];
  contact: ContactInfo;
  extractionConfidence: number;  // 0–100 overall
  isImageOnly: boolean;
  hasMinimalText: boolean;
  detectedLanguage: string;      // 'en' only currently
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  hasMultiColumn: boolean;
  hasTable: boolean;
  hasSpecialCharBlocks: boolean;
  fileName_issue: boolean;       // e.g. resume_final_final.pdf
}

// ─── Build reverse alias map ──────────────────────────────────────────────────

type SectionAliasMap = Record<string, string[]>;
const aliasData = sectionAliasesData.sectionAliases as SectionAliasMap;

const headingToType: Map<string, string> = new Map();
for (const [type, aliases] of Object.entries(aliasData)) {
  for (const alias of aliases) {
    headingToType.set(alias.toLowerCase(), type);
  }
}

function normalizeHeading(heading: string): string | null {
  const lower = heading.toLowerCase().trim();
  if (headingToType.has(lower)) return headingToType.get(lower)!;
  // Fuzzy: check if any alias is contained
  for (const [alias, type] of headingToType.entries()) {
    if (lower.includes(alias) || alias.includes(lower)) return type;
  }
  return null;
}

// ─── Contact extraction ───────────────────────────────────────────────────────

const EMAIL_RE = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;
const PHONE_RE = /(\+?[\d][\d\s\-().]{7,}\d)/g;
const LINKEDIN_RE = /(?:linkedin\.com\/in\/)([\w\-]+)/gi;
const GITHUB_RE = /(?:github\.com\/)([\w\-]+)/gi;
const PORTFOLIO_RE = /(?:https?:\/\/)((?!(?:linkedin|github))[\w\-]+\.(?:com|io|dev|me|co|app|xyz)(?:\/[\w\-./]*)?)/gi;
const NAME_RE = /^([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})/m;

function extractContact(text: string): ContactInfo {
  const emailMatch = text.match(EMAIL_RE);
  const phoneMatch = text.match(PHONE_RE);
  const linkedinMatch = LINKEDIN_RE.exec(text);
  const githubMatch = GITHUB_RE.exec(text);
  PORTFOLIO_RE.lastIndex = 0;
  const portfolioMatch = PORTFOLIO_RE.exec(text);
  const nameMatch = text.match(NAME_RE);

  // Location: look for "City, State" or "City, Country" pattern
  const locationMatch = text.match(/\b([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+){0,2})\s*[|•\-]\s*(?=\w)/);

  return {
    name: nameMatch ? nameMatch[1] : null,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    linkedinUrl: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : null,
    githubUrl: githubMatch ? `github.com/${githubMatch[1]}` : null,
    portfolioUrl: portfolioMatch ? portfolioMatch[0] : null,
    location: locationMatch ? locationMatch[1] : null,
  };
}

// ─── Section boundary detection ───────────────────────────────────────────────

// Common heading patterns: ALL CAPS line, Title Case line followed by a colon or blank line,
// line with only 1-5 words and no punctuation (except :)
const HEADING_PATTERNS = [
  /^([A-Z][A-Z\s&\/]{3,40})$/, // ALL CAPS
  /^([A-Z][a-z]+(?: [A-Z][a-z]+){0,4})\s*:?\s*$/, // Title Case
  /^([\w\s&\/\-]{3,40})\s*:\s*$/, // Any heading with colon
];

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 60) return false;
  if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) return false;
  return HEADING_PATTERNS.some(re => re.test(trimmed));
}

// ─── Bullet extraction ────────────────────────────────────────────────────────

function extractBullets(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 10) continue;

    // Explicit bullet markers
    if (/^[•\-*▪▸◦◉►]/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[•\-*▪▸◦◉►]\s*/, '').trim());
      continue;
    }
    // Numbered bullets
    if (/^\d+[.)]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^\d+[.)]\s+/, '').trim());
      continue;
    }
    // Long lines that look like impact statements
    if (trimmed.length > 40 && trimmed.length < 300 && !isHeading(trimmed)) {
      bullets.push(trimmed);
    }
  }

  return bullets;
}

// ─── Image-only PDF detection ─────────────────────────────────────────────────

function detectImageOnly(text: string, fileSizeBytes: number): boolean {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  // If PDF is > 100KB but has < 50 words — almost certainly image-based
  if (fileSizeBytes > 100_000 && wordCount < 50) return true;
  if (wordCount < 20) return true;
  return false;
}

// ─── File name quality check ──────────────────────────────────────────────────

const BAD_FILENAMES = ['resume', 'cv', 'resume_final', 'resume_v2', 'resume_new',
  'my_resume', 'resume_updated', 'resume_final_final', 'resume copy', 'untitled',
  'document', 'resume1', 'resume2'];

function isFilenameIssue(fileName: string): boolean {
  const base = fileName.toLowerCase().replace(/\.(pdf|docx|doc)$/, '').replace(/[\s_-]/g, '');
  return BAD_FILENAMES.some(bad => base === bad.replace(/[\s_-]/g, ''));
}

// ─── Multi-column detection ───────────────────────────────────────────────────

function detectMultiColumn(text: string): boolean {
  // Heuristic: if many lines have a pattern of whitespace gap in the middle (>4 spaces)
  const lines = text.split('\n');
  let multiColLines = 0;
  for (const line of lines) {
    if (/\S {4,}\S/.test(line) && line.length > 40) multiColLines++;
  }
  return multiColLines > 5;
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseResumeText(params: {
  text: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
}): ParsedResume {
  const { text, fileName, fileMimeType, fileSizeBytes } = params;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = text.split('\n').length;
  const charCount = text.length;

  const isImageOnly = detectImageOnly(text, fileSizeBytes);
  const hasMinimalText = wordCount < 100;
  const hasMultiColumn = detectMultiColumn(text);
  const hasTable = /(\|[-]+\|)/.test(text) || /[│┌┐└┘├┤┬┴┼═╠╣╦╩╬]/.test(text);
  const hasSpecialCharBlocks = /[│┌┐└┘├┤┬┴┼═╠╣╦╩╬]{2,}/.test(text);
  const fileName_issue = isFilenameIssue(fileName);

  const contact = extractContact(text);

  // ── Section splitting ──────────────────────────────────────────────────────
  const lines = text.split('\n');
  const sections: ParsedSection[] = [];
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  const flushSection = () => {
    if (!currentHeading && currentLines.length === 0) return;
    const heading = currentHeading ?? '';
    const content = currentLines.join('\n').trim();
    const normalizedType = normalizeHeading(heading) ?? 'other';
    const bullets = extractBullets(content);
    const confidence = normalizedType !== 'other' ? 85 : 50;

    sections.push({
      type: normalizedType,
      rawHeading: heading,
      content,
      bullets,
      confidence,
    });
    currentHeading = null;
    currentLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (isHeading(trimmed) && normalizeHeading(trimmed) !== null) {
      flushSection();
      currentHeading = trimmed;
    } else {
      currentLines.push(line);
    }
  }
  flushSection();

  // If no sections detected at all, put all text into an 'unparsed' section
  if (sections.length === 0 && text.trim().length > 0) {
    sections.push({
      type: 'unparsed',
      rawHeading: '',
      content: text,
      bullets: extractBullets(text),
      confidence: 20,
    });
  }

  // ── Overall extraction confidence ─────────────────────────────────────────
  let extractionConfidence = 100;
  if (isImageOnly) extractionConfidence = 0;
  else if (hasMinimalText) extractionConfidence = 20;
  else if (sections.length === 0) extractionConfidence = 30;
  else if (wordCount < 200) extractionConfidence -= 20;
  if (hasSpecialCharBlocks) extractionConfidence -= 10;
  extractionConfidence = Math.max(0, Math.min(100, extractionConfidence));

  return {
    rawText: text,
    wordCount,
    lineCount,
    charCount,
    sections,
    contact,
    extractionConfidence,
    isImageOnly,
    hasMinimalText,
    detectedLanguage: 'en',
    fileName,
    fileMimeType,
    fileSizeBytes,
    hasMultiColumn,
    hasTable,
    hasSpecialCharBlocks,
    fileName_issue,
  };
}

export function extractResumeText(parsed: ParsedResume): string {
  return parsed.rawText;
}

export function getSectionByType(parsed: ParsedResume, type: string): ParsedSection | undefined {
  return parsed.sections.find(s => s.type === type);
}

export function getAllSectionTypes(parsed: ParsedResume): string[] {
  return [...new Set(parsed.sections.map(s => s.type))];
}
