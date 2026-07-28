import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { askGateway } from '@/lib/ai/gateway';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, roleTitle, currentOfferBase, joiningBonus, equity, location, experienceYears } = await req.json();

    if (!companyName || !roleTitle || !currentOfferBase) {
      return NextResponse.json({ error: 'Company, role title, and offered base salary are required' }, { status: 400 });
    }

    const offerNum = parseFloat(String(currentOfferBase).replace(/[^0-9.]/g, '')) || 100000;
    const targetCounter = Math.round(offerNum * 1.15); // 15% standard counter

    const benchmark75 = Math.round(offerNum * 1.18);
    const benchmark90 = Math.round(offerNum * 1.25);

    // Generate Negotiation Scripts
    const scriptBenchmark = `Subject: Regarding Job Offer - ${roleTitle} at ${companyName}

Dear Hiring Team,

Thank you so much for extending the offer for the ${roleTitle} position at ${companyName}! I am thrilled about the opportunity to contribute to the team's goals and vision.

After carefully reviewing the offer details, including the base salary of $${offerNum.toLocaleString()}, I wanted to discuss the compensation package. Based on my ${experienceYears || '3+'} years of experience in full-stack architecture, as well as current market benchmarks for ${roleTitle} roles in ${location || 'the area'}, I was hoping we could explore a base salary of $${targetCounter.toLocaleString()}.

I am extremely enthusiastic about joining ${companyName} and am confident I can make an immediate impact. I look forward to hearing your thoughts!

Best regards,
${session.user.name || 'Candidate Name'}`;

    const scriptCompeting = `Subject: Follow-up on ${roleTitle} Offer - ${companyName}

Dear Hiring Manager,

Thank you again for offering me the ${roleTitle} role at ${companyName}. I am genuinely excited about the team's technology roadmap and culture.

I am currently evaluating my options and have received a competing offer with a higher base compensation. However, ${companyName} remains my top choice because of your engineering mission and project scope.

If we can adjust the base salary to $${targetCounter.toLocaleString()} (or add a $${Math.round(offerNum * 0.08).toLocaleString()} one-time signing bonus), I would be thrilled to sign the offer immediately and decline all other opportunities.

Thank you for your flexibility and support!

Warm regards,
${session.user.name || 'Candidate Name'}`;

    const scriptPerks = `Subject: Compensation & Benefits Review - ${roleTitle}

Dear Team,

Thank you for sending over the offer for ${roleTitle} at ${companyName}!

If there is limited flexibility on the base salary of $${offerNum.toLocaleString()}, I would love to inquire if we could adjust the variable components—such as a initial signing bonus of $${Math.round(offerNum * 0.10).toLocaleString()}, additional stock grants/equity, or flexible remote workspace stipends.

I am eager to finalize our agreement and get started!

Best,
${session.user.name || 'Candidate Name'}`;

    return NextResponse.json({
      targetCounter,
      benchmarks: {
        offered: offerNum,
        p50: offerNum,
        p75: benchmark75,
        p90: benchmark90
      },
      scripts: {
        benchmark: scriptBenchmark,
        competing: scriptCompeting,
        perks: scriptPerks
      }
    });

  } catch (error: any) {
    console.error('Salary Negotiation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
