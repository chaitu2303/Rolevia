import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const [
      totalUsers,
      totalResumes,
      totalScans,
      totalInterviews,
      totalCodingAttempts,
      totalApplications,
      activeSubscriptions,
      recentAuditLogs,
      recentFeedbacks,
      openBugsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.resumeIntelligenceReport.count(),
      prisma.interviewSession.count(),
      prisma.codingSubmission.count(),
      prisma.application.count(),
      prisma.subscription.findMany({ where: { isActive: true } }),
      prisma.adminAuditLog.findMany({ take: 10, orderBy: { timestamp: 'desc' } }),
      prisma.feedback.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.bugReport.count({ where: { status: 'OPEN' } })
    ]);

    // Subscription plan distribution
    const planCounts: Record<string, number> = {
      FREE: 0,
      LAUNCH: 0,
      CAREER: 0,
      PRO: 0
    };

    activeSubscriptions.forEach(sub => {
      const plan = (sub.plan || 'FREE').toUpperCase();
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    planCounts.FREE = Math.max(0, totalUsers - (planCounts.LAUNCH + planCounts.CAREER + planCounts.PRO));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalResumes,
        totalScans,
        totalInterviews,
        totalCodingAttempts,
        totalApplications,
        openBugsCount,
        planDistribution: planCounts,
        recentAuditLogs,
        recentFeedbacks,
        billingStatus: 'MOCK_SANDBOX_ACTIVE'
      }
    });
  } catch (error: any) {
    console.error('[Admin Overview Error]:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin overview statistics.' }, { status: 500 });
  }
}
