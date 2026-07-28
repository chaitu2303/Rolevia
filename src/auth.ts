import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      // Auth.js v5 auto-reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from env
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const normalizedEmail = (credentials.email as string).toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });
        
        if (!user || !user.password) return null;
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (passwordsMatch) return user;
        return null;
      }
    })
  ],
  events: {
    // When a new user is created via Google OAuth, initialize their CareerProfile
    async createUser({ user }) {
      if (!user.id) return;
      try {
        const existing = await prisma.careerProfile.findUnique({ where: { userId: user.id } });
        if (!existing) {
          const profile = await prisma.careerProfile.create({
            data: { userId: user.id, completenessScore: 0 }
          });
          await prisma.profileBasics.create({
            data: {
              profileId: profile.id,
              email: user.email ?? null,
              name: user.name ?? null,
              status: 'USER_CREATED',
            }
          });
        }
      } catch (e) {
        console.error('[auth] Failed to init CareerProfile for new OAuth user:', e);
      }
    }
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Fetch fresh user data to get onboarding status
        const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } });
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
      }
      if (trigger === "update" && session?.user) {
        token.onboardingCompleted = session.user.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        // @ts-ignore - adding custom property to session user
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    }
  }
});
