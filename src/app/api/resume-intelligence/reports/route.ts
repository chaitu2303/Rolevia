/**
 * GET  /api/resume-intelligence/reports  → list user's intelligence reports
 * POST /api/resume-intelligence/reports  → (alias — redirects to analyze)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const authUser = session?.user;
    if (!authUser?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email } });
    if (!dbUser) return NextResponse.json({ reports: [] });

    const reports = await prisma.resumeIntelligenceReport.findMany({
      where: { userId: dbUser.id, status: 'ACTIVE' },
      select: {
        id: true,
        fileName: true,
        fileMimeType: true,
        targetRole: true,
        targetCompany: true,
        experienceLevel: true,
        careerOsScore: true,
        atsScore: true,
        contentScore: true,
        impactScore: true,
        jobMatchScore: true,
        recruiterScore: true,
        extractionStatus: true,
        hasJobDescription: true,
        label: true,
        status: true,
        reportVersion: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reports });
  } catch (err) {
    console.error('[GET /api/resume-intelligence/reports]', err);
    return NextResponse.json({ error: 'Failed to list reports' }, { status: 500 });
  }
}
