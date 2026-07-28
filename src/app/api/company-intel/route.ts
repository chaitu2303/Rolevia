import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { askGateway } from '@/lib/ai/gateway';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, roleTitle } = await req.json();
    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const targetRole = roleTitle || 'Full Stack Software Engineer';

    // Static fallback database for popular tech companies
    const COMPANY_DATABASE: Record<string, any> = {
      google: {
        company: 'Google',
        tagline: 'Search, Cloud & AI Enterprise Giant',
        culture: 'Strong emphasis on distributed systems scalability, data structures, algorithms, and collaborative system design.',
        techStack: {
          frontend: ['Angular', 'TypeScript', 'Lit', 'Web Components'],
          backend: ['C++', 'Java', 'Go', 'Python'],
          databases: ['Spanner', 'Bigtable', 'BigQuery'],
          cloud: ['Google Cloud Platform (GCP)', 'Borg', 'Kubernetes']
        },
        interviewQuestions: [
          { question: 'Design a globally distributed rate limiter like Google Cloud Armor.', category: 'System Design' },
          { question: 'Find median from a continuous data stream of billions of numbers.', category: 'DSA / Algorithms' },
          { question: 'Tell me about a time you resolved a major production outage under extreme pressure.', category: 'HR / Behavioral' }
        ],
        salaryRanges: { entry: '$140,000 - $180,000', mid: '$190,000 - $260,000', senior: '$280,000 - $420,000' }
      },
      amazon: {
        company: 'Amazon',
        tagline: 'E-Commerce & AWS Cloud Infrastructure Leader',
        culture: 'Deeply driven by 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep).',
        techStack: {
          frontend: ['React', 'TypeScript', 'TailwindCSS'],
          backend: ['Java', 'C++', 'Python', 'Node.js'],
          databases: ['DynamoDB', 'Amazon Aurora', 'Redshift'],
          cloud: ['AWS (Lambda, SQS, ECS, S3)']
        },
        interviewQuestions: [
          { question: 'Design Amazon Prime Video streaming architecture for millions of concurrent viewers.', category: 'System Design' },
          { question: 'Given an array of item prices, find top 3 combinations under budget.', category: 'DSA / Algorithms' },
          { question: 'Give an example of when you had to disagree and commit with a senior teammate.', category: 'HR / Leadership Principles' }
        ],
        salaryRanges: { entry: '$130,000 - $165,000', mid: '$175,000 - $240,000', senior: '$260,000 - $380,000' }
      }
    };

    const key = companyName.toLowerCase().trim();
    let intel = COMPANY_DATABASE[key];

    if (!intel) {
      // Generate dynamic intelligence using AI or smart fallback
      try {
        const prompt = `Provide detailed interview intelligence for candidate applying to ${companyName} for role ${targetRole}.
Return JSON format:
{
  "company": "${companyName}",
  "tagline": "Brief description of company focus",
  "culture": "Engineering culture insights",
  "techStack": {
    "frontend": ["React", "TypeScript"],
    "backend": ["Node.js", "Python"],
    "databases": ["PostgreSQL", "Redis"],
    "cloud": ["AWS", "Docker"]
  },
  "interviewQuestions": [
    {"question": "Top technical interview question...", "category": "Technical"},
    {"question": "System design or DSA question...", "category": "System Design"},
    {"question": "Behavioral question...", "category": "HR"}
  ],
  "salaryRanges": {"entry": "$90k - $120k", "mid": "$130k - $170k", "senior": "$180k - $250k"}
}`;

        const aiText = await askGateway(prompt);
        intel = JSON.parse(aiText);
      } catch (e) {
        // Fallback for general company
        intel = {
          company: companyName,
          tagline: 'Technology & Digital Enterprise',
          culture: 'Focuses on clean code architecture, agile sprint cycles, and rapid feature delivery.',
          techStack: {
            frontend: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'],
            backend: ['Node.js', 'Express', 'Python', 'Java'],
            databases: ['PostgreSQL', 'MongoDB', 'Redis'],
            cloud: ['AWS', 'Docker', 'Vercel']
          },
          interviewQuestions: [
            { question: `Describe your experience designing RESTful APIs for ${targetRole}.`, category: 'Technical' },
            { question: 'How do you optimize slow SQL query response times under high load?', category: 'Database / Performance' },
            { question: 'Describe a project where you took ownership from specification to production launch.', category: 'HR / Behavioral' }
          ],
          salaryRanges: { entry: '$85,000 - $115,000', mid: '$120,000 - $160,000', senior: '$170,000 - $240,000' }
        };
      }
    }

    return NextResponse.json({ intel });

  } catch (error: any) {
    console.error('Company Intel Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
