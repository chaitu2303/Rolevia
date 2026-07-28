import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user + initialize empty CareerProfile in one transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name,
        }
      });

      // Create empty CareerProfile so onboarding can populate it
      const profile = await tx.careerProfile.create({
        data: {
          userId: newUser.id,
          completenessScore: 0,
        }
      });

      await tx.profileBasics.create({
        data: {
          profileId: profile.id,
          email: normalizedEmail,
          name: name || null,
          status: 'USER_CREATED',
        }
      });

      return newUser;
    });

    return NextResponse.json({ user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
