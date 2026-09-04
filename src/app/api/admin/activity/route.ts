import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30')));

    const [recentActivities, featureDistribution, totalCreditsConsumed] = await Promise.all([
      prisma.usageLedger.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        }
      }),
      prisma.usageLedger.groupBy({
        by: ['feature'],
        _count: { feature: true },
        _sum: { creditsConsumed: true }
      }),
      prisma.usageLedger.aggregate({
        _sum: { creditsConsumed: true }
      })
    ]);

    return NextResponse.json({
      success: true,
      activities: recentActivities,
      featureDistribution,
      totalCreditsConsumed: totalCreditsConsumed._sum.creditsConsumed || 0
    });
  } catch (error: any) {
    console.error('[Admin Activity GET Error]:', error);
    return NextResponse.json({ error: 'Failed to retrieve activity telemetry.' }, { status: 500 });
  }
}
