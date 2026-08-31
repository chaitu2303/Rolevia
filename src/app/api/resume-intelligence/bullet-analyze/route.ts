/**
 * POST /api/resume-intelligence/bullet-analyze
 * Real-time single bullet analysis (no DB storage).
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { analyzeBullet } from '@/lib/intelligence/BulletAnalyzer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bullet } = body;

    if (!bullet || typeof bullet !== 'string') {
      return NextResponse.json({ error: 'Missing bullet text' }, { status: 400 });
    }

    if (bullet.trim().length < 3) {
      return NextResponse.json({ error: 'Bullet too short' }, { status: 400 });
    }

    const analysis = analyzeBullet(bullet.trim());

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('[POST /api/resume-intelligence/bullet-analyze]', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
