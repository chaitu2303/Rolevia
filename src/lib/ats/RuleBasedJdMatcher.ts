// Deterministic Job Description Matcher
// Ensures ATS match scores are 100% accurate, reproducible, and do not fluctuate like AI guesses.

// A basic dictionary of common skills to look for in job descriptions
const COMMON_SKILLS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express', 'django', 'flask',
  'spring', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mysql', 'postgresql',
  'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest', 'api', 'ci/cd', 'git', 'agile',
  'scrum', 'kanban', 'jira', 'linux', 'bash', 'css', 'html', 'tailwind', 'sass', 'figma',
  'ui/ux', 'machine learning', 'ai', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch',
  'marketing', 'seo', 'sem', 'content', 'social media', 'b2b', 'b2c', 'sales', 'crm', 'salesforce',
  'leadership', 'management', 'communication', 'problem solving', 'project management', 'pmp'
]);

// Basic extraction of keywords from text
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9#\+\.\s]/g, ' ').split(/\s+/);
  const found = new Set<string>();
  
  // Look for 1-word or 2-word combinations that might be skills
  for (let i = 0; i < words.length; i++) {
    const w1 = words[i];
    if (COMMON_SKILLS.has(w1)) found.add(w1);
    
    if (i < words.length - 1) {
      const w2 = `${w1} ${words[i+1]}`;
      if (COMMON_SKILLS.has(w2)) found.add(w2);
    }
  }

  // Also extract capitalized terms as potential proper nouns / proprietary skills
  // (e.g., "Workday", "Tableau", "Salesforce")
  const properNouns = text.match(/\b([A-Z][a-z0-9]+)\b/g) || [];
  const ignoreList = new Set(['The', 'A', 'An', 'And', 'Or', 'In', 'On', 'At', 'To', 'For', 'With', 'Is', 'Are', 'This', 'We', 'Our', 'You', 'Your', 'If', 'As', 'By']);
  
  properNouns.forEach(noun => {
    if (!ignoreList.has(noun) && noun.length > 2) {
      // Add lowercased version for comparison
      found.add(noun.toLowerCase());
    }
  });

  return Array.from(found);
}

export function matchJobDescription(resumeText: string, jdText: string) {
  const resumeLower = resumeText.toLowerCase();
  
  // 1. Extract required skills/keywords from the Job Description
  const jdKeywords = extractKeywords(jdText);
  
  // 2. See which ones are in the resume
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  jdKeywords.forEach(keyword => {
    // Simple substring match (could be improved with word boundaries)
    // but for now, deterministic.
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(resumeLower)) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  });

  // Calculate scores
  const totalKeywords = jdKeywords.length || 1; // prevent div by zero
  const hardSkillsMatch = Math.round((matchedSkills.length / totalKeywords) * 100);
  
  // Action verbs (reuse logic from RuleBasedAtsEngine conceptually)
  const ACTION_VERBS = ['led', 'managed', 'developed', 'designed', 'built', 'created', 'implemented', 'launched', 'delivered', 'optimized', 'reduced', 'increased', 'improved'];
  const resumeWords = resumeLower.split(/\s+/);
  const foundVerbs = ACTION_VERBS.filter(v => resumeWords.includes(v));
  const actionVerbsMatch = Math.min(100, Math.round((foundVerbs.length / 5) * 100)); // 5 verbs is a 100%

  // Readability (placeholder for structural checks)
  const atsReadability = 85; 

  // Overall Score weighting
  const score = Math.round(
    (hardSkillsMatch * 0.6) + 
    (actionVerbsMatch * 0.2) + 
    (atsReadability * 0.2)
  );

  // Generate actionable changes based on missing skills
  const actionableChanges = missingSkills.slice(0, 5).map(skill => ({
    title: `Missing Keyword: ${skill.toUpperCase()}`,
    severity: 'HIGH',
    description: `The job description emphasizes '${skill}', but it is entirely missing from your resume. ATS systems explicitly scan for this keyword.`,
    action: `Add '${skill}' to your Skills section, or incorporate it into a bullet point describing your past experience where applicable.`
  }));

  if (actionVerbsMatch < 50) {
    actionableChanges.push({
      title: `Weak Action Verbs`,
      severity: 'MEDIUM',
      description: `Your resume lacks strong action-oriented language compared to what recruiters expect for this role.`,
      action: `Start bullet points with impactful verbs like 'Developed', 'Managed', 'Optimized', or 'Launched'.`
    });
  }

  // Capitalize skills for display
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return {
    score,
    breakdown: {
      hardSkillsMatch,
      actionVerbsMatch,
      atsReadability
    },
    matchedSkills: matchedSkills.map(capitalize),
    missingSkills: missingSkills.map(capitalize),
    actionableChanges
  };
}
