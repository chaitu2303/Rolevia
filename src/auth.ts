import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    }),
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Authenticate user credentials against database
        const normalizedEmail = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (user && user.password) {
          const isValid = await bcrypt.compare(String(credentials.password), user.password);
          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as "USER" | "ADMIN" | "OWNER",
            };
          }
        }

        return null;
      },
    }),
  ],
});
