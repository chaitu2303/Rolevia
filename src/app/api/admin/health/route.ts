import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  const startTime = Date.now();
  let dbStatus = 'UNKNOWN';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'HEALTHY';
  } catch (e) {
    dbStatus = 'ERROR';
  }

  const hasResend = !!process.env.RESEND_API_KEY;
  const hasAuthSecret = !!process.env.AUTH_SECRET;
  const hasGoogleOauth = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const nodeEnv = process.env.NODE_ENV || 'development';

  return NextResponse.json({
    success: true,
    health: {
      status: dbStatus === 'HEALTHY' ? 'HEALTHY' : 'DEGRADED',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      services: {
        database: {
          status: dbStatus,
          provider: 'Neon PostgreSQL',
          latencyMs: dbLatencyMs
        },
        authentication: {
          status: hasAuthSecret ? 'CONFIGURED' : 'NOT_CONFIGURED',
          googleOauth: hasGoogleOauth ? 'CONFIGURED' : 'NOT_CONFIGURED'
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
