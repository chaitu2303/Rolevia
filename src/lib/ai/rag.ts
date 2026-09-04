/**
 * RAG Context Builder
 * Securely retrieves and injects user-specific context into AI prompts.
 */


import { vectorStore } from './vectorStore';
import { CAREER_TOPICS } from './CareerKnowledgeBase';

export interface CareerContext {
  userId: string;
  verifiedFacts: string[];
  jobTarget?: string;
  careerRole?: string;
  skills: string[];
  ragAdvice: string[];
}

let isInitialized = false;

// Initialize the Vector Store with Career Knowledge chunks
async function initVectorStore() {
  if (isInitialized) return;
  
  const docs = [];
  for (const [category, tips] of Object.entries(CAREER_TOPICS)) {
    for (const tip of tips) {
      docs.push({
        id: `${category}-${Math.random().toString(36).substring(7)}`,
        text: tip,
        metadata: { category }
      });
    }
  }
  
  await vectorStore.addDocuments(docs);
  isInitialized = true;
}

export async function retrieveCareerAdvice(query: string, k: number = 3): Promise<string[]> {
  await initVectorStore();
  const results = await vectorStore.similaritySearch(query, k);
  return results.map(doc => doc.text);
}

export async function buildContext(userId: string, query: string = ""): Promise<CareerContext> {
  // In a real implementation, query the DB for the master profile.
  const ragAdvice = query ? await retrieveCareerAdvice(query) : [];

  return {
    userId,
    verifiedFacts: [
      "User has 5 years of software engineering experience.",
      "Primary language is TypeScript."
    ],
    jobTarget: "Senior Frontend Engineer",
    careerRole: "Software Engineer",
    skills: ["TypeScript", "React", "Next.js", "Node.js"],
    ragAdvice
  };
}

export function formatContextForPrompt(context: CareerContext): string {
  return `
[CAREEROS VERIFIED CONTEXT]
Role: ${context.careerRole || 'Not specified'}
Target: ${context.jobTarget || 'Not specified'}
Verified Facts:
${context.verifiedFacts.map(f => `- ${f}`).join('\n')}
Skills: ${context.skills.join(', ')}

[RAG KNOWLEDGE INJECTION]
Relevant Career Advice:
${context.ragAdvice.map(advice => `- ${advice}`).join('\n')}
  `.trim();
}
