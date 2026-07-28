// Career Knowledge Base — rich, structured career advice
// Used to augment the AI model with domain-specific context

export const CAREER_SYSTEM_PROMPT = `You are CareerBot, an expert career coach and job placement advisor.
You help people with: resume writing, interview preparation, ATS optimization, job searching, salary negotiation, career transitions, LinkedIn profiles, cover letters, and career planning.
You give specific, actionable, and honest advice. Keep answers concise (3-5 sentences max).
Never give generic advice — always be specific and practical.`;

export const CAREER_TOPICS: Record<string, string[]> = {
  resume: [
    'Use strong action verbs: Led, Engineered, Optimized, Delivered, Reduced, Increased',
    'Quantify every achievement. Bad: "Managed team." Good: "Led 8-engineer team, shipping 3 features/sprint"',
    'ATS-friendly: no tables, no headers, no graphics. Simple 2-column or single-column layouts',
    'Tailor your resume for every job. Use keywords directly from the job description',
    'Keep it to 1 page for <10 years experience, 2 pages max for senior roles',
  ],
  interview: [
    'Use STAR method: Situation, Task, Action, Result for behavioral questions',
    'Research the company: recent news, products, culture, leadership',
    'Prepare 5 questions to ask the interviewer — it shows genuine interest',
    'For technical rounds: think out loud, communicate your approach before coding',
    'Salary negotiation: never give the first number. Let them anchor first.',
  ],
  ats: [
    'ATS systems scan for keyword density. Mirror the job description language exactly',
    'Use standard section names: Experience, Education, Skills — not creative alternatives',
    'PDF or DOCX format — avoid images, graphics, and text boxes',
    'Include both spelled-out and acronym versions: "Artificial Intelligence (AI)"',
    'Put your most relevant skills in the first 1/3 of your resume',
  ],
  salary: [
    'Research market rates: Glassdoor, Levels.fyi, LinkedIn Salary, Payscale',
    'Always negotiate — 85% of employers expect it and have budget reserved',
    'Negotiate total compensation: base, bonus, equity, benefits, PTO, remote flexibility',
    'Counter-offer formula: Anchor 10-20% above your target, never below',
    'Never accept on the spot — always say "I need 24 hours to review"',
  ],
  linkedin: [
    'Your headline should target the role you want, not just your current title',
    'LinkedIn profile with a photo gets 21x more views than without',
    'Write your summary in first person. Tell your story. Make it human.',
    'Add 5+ skills — they make you discoverable in recruiter searches',
    'Post content weekly: insights, learnings, industry news — builds authority',
  ],
  jobSearch: [
    'Apply to 10-15 quality roles/week, not 100 random ones',
    'Warm referrals get 10x higher interview rates. Ask your network first.',
    'Follow up after 5-7 business days if no response — it is expected',
    'Track applications: date applied, status, follow-up date, contacts',
    'Focus on companies, not just roles — research culture fit deeply',
  ],
};

// Smart topic detection from user message
export function detectTopics(message: string): string[] {
  const lower = message.toLowerCase();
  const detected: string[] = [];

  if (/resume|cv|curriculum|ats|parse|scan|bullet|achiev/i.test(lower)) detected.push('resume');
  if (/interview|behavioral|star|technical|coding|mock/i.test(lower)) detected.push('interview');
  if (/ats|applicant tracking|parse rate|keyword/i.test(lower)) detected.push('ats');
  if (/salary|pay|compens|negotiate|offer|raise|apprais/i.test(lower)) detected.push('salary');
  if (/linkedin|profile|network|connect/i.test(lower)) detected.push('linkedin');
  if (/job|apply|search|hunt|opening|position|role/i.test(lower)) detected.push('jobSearch');

  return detected;
}

export function buildPrompt(userMessage: string, history: { role: string; content: string }[]): string {
  const topics = detectTopics(userMessage);
  const contextLines: string[] = [];

  topics.forEach(topic => {
    const tips = CAREER_TOPICS[topic];
    if (tips) {
      contextLines.push(`[${topic.toUpperCase()} TIPS]: ${tips.slice(0, 2).join(' | ')}`);
    }
  });

  const historyContext = history.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'CareerBot'}: ${m.content}`).join('\n');

  return `${CAREER_SYSTEM_PROMPT}

${contextLines.length > 0 ? 'Relevant Context:\n' + contextLines.join('\n') : ''}

${historyContext ? 'Conversation History:\n' + historyContext : ''}

User: ${userMessage}
CareerBot:`;
}

// Smart keyword-based instant responses for common questions
export const QUICK_RESPONSES: { pattern: RegExp; response: string }[] = [
  {
    pattern: /hello|hi|hey|start|begin/i,
    response: `Hi! I'm CareerBot — your free, private AI career coach running entirely on your device. No data sent to any server. Ever. Ask me anything: resume tips, interview prep, salary negotiation, ATS optimization, or job search strategy. What can I help you with today?`
  },
  {
    pattern: /what can you do|help|capabilities/i,
    response: `I can help you with:\n\n📄 **Resume Writing** — ATS optimization, bullet crafting, formatting\n🎤 **Interview Prep** — STAR method, behavioral & technical questions\n💰 **Salary Negotiation** — market research, counter-offer scripts\n🔍 **Job Search Strategy** — application tips, referral networks\n🔗 **LinkedIn Optimization** — headline, summary, visibility\n📊 **ATS Scanning** — why your resume gets rejected\n\nJust ask!`
  },
  {
    pattern: /resume.*format|format.*resume/i,
    response: `**Best resume format for ATS:**\n\n✅ Single or two-column layout\n✅ Standard fonts: Arial, Calibri, or Georgia (10-12pt)\n✅ Section headers: Experience, Education, Skills\n✅ PDF format (most modern ATS can read it)\n❌ No tables, graphics, text boxes, or headers/footers\n❌ No images or icons in the body\n\nWant me to critique your specific resume?`
  },
  {
    pattern: /action verb|strong verb|weak/i,
    response: `**Power action verbs for resumes:**\n\n🚀 Leadership: Led, Directed, Managed, Mentored, Spearheaded\n⚡ Achievement: Delivered, Launched, Achieved, Exceeded, Secured\n📈 Improvement: Optimized, Streamlined, Reduced, Increased, Accelerated\n🔧 Technical: Engineered, Architected, Developed, Implemented, Deployed\n\n❌ Avoid: Responsible for, Assisted with, Helped, Worked on`
  },
  {
    pattern: /salary|how much|pay|compensation/i,
    response: `**Salary negotiation playbook:**\n\n1. Never give the first number — let them anchor\n2. Research: Glassdoor, Levels.fyi, LinkedIn Salary\n3. Counter 10-15% above your target (they'll meet in the middle)\n4. Negotiate total comp: base + bonus + equity + PTO\n5. Always say: "I need 24 hours to review" — never accept on the spot\n\n**Script:** "Based on my research and experience, I was expecting something in the range of [X-Y]. Is there flexibility there?"`
  },
];
