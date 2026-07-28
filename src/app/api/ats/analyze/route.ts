import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isAiAvailable, askGateway } from '@/lib/ai/gateway';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobDescription } = await req.json();
    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        careerProfile: {
          include: { basics: true, skills: true, experiences: true, projects: true, educations: true }
        }, 
        resumes: {
          select: { id: true, title: true, content: true, atsScore: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = user.careerProfile;
    const masterProfileText = [
      profile?.basics?.name || '',
      profile?.basics?.summary || '',
      ...(profile?.skills || []).map((s: any) => s.name),
      ...(profile?.experiences || []).map((e: any) => `${e.role} ${e.company} ${e.description} ${(e.bullets || []).join(' ')}`),
      ...(profile?.projects || []).map((p: any) => `${p.name} ${p.description} ${(p.bullets || []).join(' ')}`),
      ...(user.resumes || []).map((r: any) => r.content ? JSON.stringify(r.content) : '')
    ].join(' ').toLowerCase();

    // Technical Keywords & Framework Dictionary
    const TECH_DICTIONARY = [
      'react', 'next.js', 'nextjs', 'node.js', 'nodejs', 'typescript', 'javascript',
      'python', 'java', 'c++', 'go', 'golang', 'rust', 'express', 'nest.js',
      'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'prisma', 'graphql',
      'rest api', 'aws', 'docker', 'kubernetes', 'ci/cd', 'git', 'system design',
      'microservices', 'tailwind', 'tailwindcss', 'redux', 'jest', 'cypress', 'html5', 'css3'
    ];

    const jdLower = jobDescription.toLowerCase();

    // 1. Extract Hard Skills from JD
    const jdSkillsFound = TECH_DICTIONARY.filter(tech => jdLower.includes(tech));
    
    // Fallback: extract prominent capitalized terms or tech-like words if dictionary is sparse
    const wordsInJd = Array.from(new Set(jdLower.match(/\b[a-z0-9\.+#-]{3,}\b/g) || []));
    const customTechTerms = wordsInJd.filter(w => 
      !['with', 'from', 'this', 'that', 'have', 'your', 'will', 'team', 'work', 'experience', 'years', 'ability', 'strong', 'good'].includes(w) &&
      (w.includes('js') || w.includes('sql') || w.includes('api') || w.includes('cloud') || w.includes('data') || w.includes('app'))
    );

    const targetKeywords = Array.from(new Set([...jdSkillsFound, ...customTechTerms])).slice(0, 15);

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    targetKeywords.forEach(kw => {
      if (masterProfileText.includes(kw)) {
        matchedSkills.push(kw.toUpperCase());
      } else {
        missingSkills.push(kw.toUpperCase());
      }
    });

    // 2. Action Verbs Evaluation
    const STRONG_ACTION_VERBS = [
      'engineered', 'architected', 'spearheaded', 'optimized', 'implemented',
      'developed', 'scaled', 'accelerated', 'transformed', 'built', 'reduced'
    ];
    const verbsFound = STRONG_ACTION_VERBS.filter(verb => masterProfileText.includes(verb));
    const verbScore = Math.min(100, Math.round((verbsFound.length / 4) * 100));

    // 3. Formatting & Contact Check
    const hasEmail = Boolean(profile?.basics?.email || user.email);
    const hasPhone = Boolean(profile?.basics?.phone);
    const hasLinkedin = Boolean(profile?.basics?.linkedinUrl);
    const readabilityScore = (hasEmail ? 40 : 0) + (hasPhone ? 30 : 0) + (hasLinkedin ? 30 : 0);

    // 4. Calculate Weighted ATS Match Score
    const skillScore = targetKeywords.length > 0
      ? Math.round((matchedSkills.length / targetKeywords.length) * 100)
      : 75;

    const overallScore = Math.round(
      (skillScore * 0.50) + (verbScore * 0.30) + (readabilityScore * 0.20)
    );

    // 5. Generate Explicit Actionable Changes Required
    const actionableChanges = [];

    if (missingSkills.length > 0) {
      actionableChanges.push({
        type: 'MISSING_KEYWORDS',
        severity: 'CRITICAL',
        title: 'Add Missing Technical Keywords',
        description: `Your resume is currently missing key recruitment terms: ${missingSkills.slice(0, 6).join(', ')}.`,
        action: `Add a "Core Technologies" group under Skills section containing: ${missingSkills.slice(0, 6).join(', ')}.`
      });
    }

    if (verbScore < 70) {
      actionableChanges.push({
        type: 'WEAK_VERBS',
        severity: 'HIGH',
        title: 'Upgrade Experience Action Verbs with Quantifiable Impact',
        description: 'Your bullet points use passive descriptions ("worked on", "responsible for").',
        action: 'Rewrite bullet points using high-impact verbs like "Engineered", "Architected", or "Optimized", and include % metrics (e.g. "Reduced API response latency by 35%").'
      });
    }

    if (!hasLinkedin || !hasPhone) {
      actionableChanges.push({
        type: 'FORMATTING',
        severity: 'MEDIUM',
        title: 'Complete Professional Header Links',
        description: 'Missing direct LinkedIn profile or phone number in contact header.',
        action: 'Add your LinkedIn profile URL and phone number at the top of your resume for 100% parser readability.'
      });
    }

    // 6. Generate Tailored Resume Output
    const candidateName = profile?.basics?.name || user.name || 'Candidate Name';
    const candidateEmail = profile?.basics?.email || user.email;
    const candidatePhone = profile?.basics?.phone || '+1 (555) 019-2834';
    const candidateLocation = profile?.basics?.location || 'New York, NY';
    
    const tailoredResume = `
${candidateName.toUpperCase()}
${candidateEmail} | ${candidatePhone} | ${candidateLocation} | linkedin.com/in/profile

PROFESSIONAL SUMMARY
Results-driven Software Engineer specialized in ${matchedSkills.slice(0, 3).join(', ') || 'modern software architecture'}. Experienced in designing scalable backend APIs and responsive user interfaces. Leveraged ${[...matchedSkills, ...missingSkills].slice(0, 4).join(', ')} to deliver robust production systems aligned with recruitment standards.

TECHNICAL SKILLS
• Mastered Technologies: ${matchedSkills.join(', ') || 'JavaScript, React, Node.js, HTML5, CSS3'}
• Target Stack Additions: ${missingSkills.join(', ') || 'TypeScript, Next.js, PostgreSQL, Docker'}

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Target Tech Corp
• Engineered high-performance RESTful microservices utilizing ${matchedSkills[0] || 'Node.js'} and ${missingSkills[0] || 'PostgreSQL'}, accelerating query execution by 40%.
• Spearheaded frontend component refactoring using ${matchedSkills[1] || 'React'} and ${missingSkills[1] || 'TypeScript'}, improving Core Web Vitals performance score to 98%.
• Optimized CI/CD build pipelines and automated testing, reducing production deployment errors by 50%.

EDUCATION
Bachelor of Science in Computer Science & Engineering | Accredited University
    `.trim();

    return NextResponse.json({
      score: overallScore,
      breakdown: {
        hardSkillsMatch: skillScore,
        actionVerbsMatch: verbScore,
        atsReadability: readabilityScore
      },
      matchedSkills: matchedSkills.slice(0, 12),
      missingSkills: missingSkills.slice(0, 12),
      actionableChanges,
      tailoredResume
    });

  } catch (error: any) {
    console.error('ATS Analysis Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
