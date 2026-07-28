import { GroundedProfile } from './EvidenceGroundingEngine';

import { z } from 'zod';
import { isAiAvailable, extractEntities } from '@/lib/ai/gateway';
import { GroundedProfile } from './EvidenceGroundingEngine';

const JobAnalysisSchema = z.object({
  roleTitle: z.string().describe('The official role title of the job'),
  company: z.string().describe('The name of the company hiring'),
  extractedSkills: z.object({
    required: z.array(z.string()).describe('List of strictly required technical skills and domain skills'),
    preferred: z.array(z.string()).describe('List of bonus or preferred skills'),
    tools: z.array(z.string()).describe('Specific software, tools, or platforms mentioned')
  }),
  extractedReqs: z.object({
    experience: z.number().describe('Minimum years of experience required (estimate if not explicit)'),
    education: z.array(z.string()).describe('Required education degrees or certifications'),
    responsibilities: z.array(z.string()).describe('Top 3-5 core responsibilities')
  }),
  keywords: z.array(z.string()).describe('10-15 key words or phrases crucial for ATS matching'),
  matchAnalysis: z.object({
    overallScore: z.number().describe('Score out of 100 for overall fit based on candidate profile'),
    skillMatchScore: z.number().describe('Score out of 100 purely on skills match'),
    experienceMatchScore: z.number().describe('Score out of 100 on years of experience and domain relevance'),
    missingSkills: z.array(z.string()).describe('Important skills required by JD but missing in profile'),
    matchingSkills: z.array(z.string()).describe('Skills present in both JD and profile'),
    recommendations: z.array(z.string()).describe('Actionable advice for the candidate to improve their chances')
  })
});

export class JobIntelligenceEngine {
  static async analyze(jobDescription: string, profile: GroundedProfile | null) {
    if (!isAiAvailable()) {
      throw new Error('AI Gateway is currently offline. Please configure your Ollama or API keys.');
    }

    const safeProfile = profile || { basics: {}, skills: [], experiences: [], educations: [], projects: [], certifications: [] };
    
    // Only pass necessary facts to avoid token bloat
    const profileContext = {
      skills: safeProfile.skills.map(s => s.name),
      experience: safeProfile.experiences.map(e => ({ role: e.role, company: e.company, description: e.description })),
      education: safeProfile.educations.map(e => e.degree)
    };

    const prompt = `
You are an expert Technical Recruiter and ATS AI. Analyze the following Job Description against the Candidate's Profile.

JOB DESCRIPTION:
"""
${jobDescription}
"""

CANDIDATE PROFILE:
"""
${JSON.stringify(profileContext, null, 2)}
"""

Extract the exact Job Title, Company, and all requirements from the JD. Then calculate the match scores strictly comparing the JD against the provided Candidate Profile.
`;

    const aiResult = await extractEntities(prompt, JobAnalysisSchema, {
      systemPrompt: 'You are an elite Recruitment AI. Always return valid JSON conforming to the requested schema. Be extremely accurate with your match calculations.'
    });

    return aiResult;
  }
}
