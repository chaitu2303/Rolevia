import { LocalExtractionAdapter } from '@/lib/extraction/local-adapter';

export class ResumeIntelligenceEngine {
  static async parse(buffer: Buffer, mimeType: string) {
    const adapter = new LocalExtractionAdapter();
    const rawText = await adapter.extract(buffer, mimeType);
    
import { LocalExtractionAdapter } from '@/lib/extraction/local-adapter';
import { z } from 'zod';
import { isAiAvailable, extractEntities } from '@/lib/ai/gateway';

const ResumeExtractionSchema = z.object({
  basics: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedinUrl: z.string().nullable(),
    summary: z.string().nullable()
  }),
  skills: z.array(z.object({
    name: z.string(),
    level: z.string().nullable(),
    yearsOfExperience: z.number().nullable()
  })),
  experiences: z.array(z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    description: z.string().nullable(),
    highlights: z.array(z.string())
  })),
  educations: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable()
  })),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().nullable(),
    techStack: z.array(z.string()),
    url: z.string().nullable()
  })),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().nullable(),
    date: z.string().nullable()
  }))
});

export class ResumeIntelligenceEngine {
  static async parse(buffer: Buffer, mimeType: string) {
    const adapter = new LocalExtractionAdapter();
    const rawText = await adapter.extract(buffer, mimeType);
    
    if (!isAiAvailable()) {
      throw new Error('AI Gateway is currently offline. Please configure your Ollama or API keys to parse resumes.');
    }

    const prompt = \`
You are an expert Resume Parsing AI.
Extract all structured data from the following raw resume text.

RAW RESUME TEXT:
"""
\${rawText.substring(0, 20000)}
"""

Extract the candidate's basics, skills, experiences, education, projects, and certifications.
\`;

    const facts = await extractEntities(prompt, ResumeExtractionSchema, {
      systemPrompt: 'You are an elite Resume Parsing AI. Return highly accurate JSON conforming to the schema.'
    });

    return {
      parsedData: facts,
      rawText
    };
  }
}
