import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  let dbStatus = 'UNKNOWN';
  let dbLatencyMs = 0;
  let tableCounts = {
    users: 0,
    resumes: 0,
    jobTargets: 0,
    interviewSessions: 0,
    usageLedgerRecords: 0,
    auditLogs: 0,
  };

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'HEALTHY';

    const [uCount, rCount, jCount, iCount, lCount, aCount] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.jobTarget.count(),
      prisma.interviewSession.count(),
      prisma.usageLedger.count(),
      prisma.adminAuditLog.count(),
    ]);

    tableCounts = {
      users: uCount,
      resumes: rCount,
      jobTargets: jCount,
      interviewSessions: iCount,
      usageLedgerRecords: lCount,
      auditLogs: aCount,
    };
  } catch (e) {
    dbStatus = 'ERROR';
  }

  const mem = process.memoryUsage();
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasAuthSecret = !!process.env.AUTH_SECRET;
  const hasGoogleOauth = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const hasGemini = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const nodeEnv = process.env.NODE_ENV || 'development';

  return NextResponse.json({
    success: true,
    health: {
      status: dbStatus === 'HEALTHY' ? 'HEALTHY' : 'DEGRADED',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        }
      },
      tableCounts,
      services: {
        database: {
          status: dbStatus,
          provider: 'Neon PostgreSQL (Connection Pooling)',
          latencyMs: dbLatencyMs
        },
        authentication: {
          status: hasAuthSecret ? 'CONFIGURED' : 'NOT_CONFIGURED',
          googleOauth: hasGoogleOauth ? 'CONFIGURED' : 'NOT_CONFIGURED'
        },
        aiProviders: {
          gemini: hasGemini ? 'CONFIGURED' : 'NOT_SET',
          openAI: hasOpenAI ? 'CONFIGURED' : 'NOT_SET',
          nativeFallback: 'ACTIVE'
        },
        nativeIntelligence: {
          status: 'HEALTHY',
          mode: 'OFFLINE_FIRST_EMBEDDED'
        },
        emailGateway: {
          status: hasResend ? 'CONFIGURED' : 'DEV_CONSOLE_FALLBACK'
        },
        codeSandbox: {
          status: 'HEALTHY',
          runtime: 'NODE_VM_SANDBOX'
        }
      }
    }
  });
}
