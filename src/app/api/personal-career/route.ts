import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let careerModel = await prisma.personalCareerModel.findUnique({
      where: { userId: session.user.id }
    });

    if (!careerModel) {
      // Initialize with sensible defaults for role matching
      careerModel = await prisma.personalCareerModel.create({
        data: {
          userId: session.user.id,
          experienceLevel: 'FRESHER',
          targetRoles: ['Software Engineer'],
          skills: [
            { name: 'JavaScript', level: 'Strong', evidence: 'Used in Frontend projects' },
            { name: 'React', level: 'Strong', evidence: 'Built dashboard UI' },
            { name: 'Node.js', level: 'Intermediate', evidence: 'Created API services' }
          ],
          strengths: ['Problem Solving', 'Fast Learner'],
          weaknesses: ['Public Speaking', 'System Design Scale'],
          learningProgress: []
        }
      });
    }

    return NextResponse.json(careerModel);
  } catch (error: any) {
    console.error('[GET /api/personal-career]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.personalCareerModel.upsert({
      where: { userId: session.user.id },
      update: {
        careerIdentity: body.careerIdentity,
        skills: body.skills,
        experienceLevel: body.experienceLevel,
        careerGoals: body.careerGoals,
        targetRoles: body.targetRoles,
        targetCompanies: body.targetCompanies,
        targetLocations: body.targetLocations,
        preferredIndustries: body.preferredIndustries,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
        learningProgress: body.learningProgress,
        preferences: body.preferences,
      },
      create: {
        userId: session.user.id,
        careerIdentity: body.careerIdentity,
        skills: body.skills,
        experienceLevel: body.experienceLevel,
        careerGoals: body.careerGoals,
        targetRoles: body.targetRoles,
        targetCompanies: body.targetCompanies,
        targetLocations: body.targetLocations,
        preferredIndustries: body.preferredIndustries,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
        learningProgress: body.learningProgress,
        preferences: body.preferences,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[POST /api/personal-career]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
