import { NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_FLAGS = [
  { key: 'MAINTENANCE_MODE', enabled: false, description: 'Temporarily pause non-admin platform access for system maintenance' },
  { key: 'GUEST_ATS_SCAN', enabled: true, description: 'Allow unauthenticated guests to run ephemeral resume scans on homepage' },
  { key: 'AI_MOCK_INTERVIEW', enabled: true, description: 'Enable LLM adaptive question generator and turn-by-turn answer scoring' },
  { key: 'AI_RESUME_INTELLIGENCE', enabled: true, description: 'Enable AI-driven resume bullet rewrite suggestions and skill gap analysis' },
  { key: 'AUTO_APPLY_ENGINE', enabled: true, description: 'Enable browser application autofill and copilot synchronization' },
  { key: 'CODING_SANDBOX', enabled: true, description: 'Allow execution of JavaScript/Node solutions inside VM runner' },
];

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    let flags = await prisma.featureFlag.findMany({
      orderBy: { key: 'asc' }
    });

    // Auto-bootstrap default flags if none exist in the database
    if (flags.length === 0) {
      for (const def of DEFAULT_FLAGS) {
        await prisma.featureFlag.upsert({
          where: { key: def.key },
          create: def,
          update: {}
        });
      }
      flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    }

    return NextResponse.json({ success: true, flags });
  } catch (error: any) {
    console.error('[Admin FeatureFlags GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const { key, enabled } = await req.json();

    if (!key || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Flag key and enabled boolean are required' }, { status: 400 });
    }

    const updated = await prisma.featureFlag.upsert({
      where: { key },
      create: { key, enabled, description: `Dynamic flag ${key}` },
      update: { enabled }
    });

    await logAdminAction(
      authCheck.user.id,
      'CONFIG_UPDATED',
      `FLAG_${key}:${enabled ? 'ENABLED' : 'DISABLED'}`,
      { key, enabled }
    );

    return NextResponse.json({ success: true, flag: updated });
  } catch (error: any) {
    console.error('[Admin FeatureFlags POST Error]:', error);
    return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 });
  }
}
