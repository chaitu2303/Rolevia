import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin") && !nextUrl.pathname.startsWith("/admin/login");
      
      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (userRole !== "ADMIN" && userRole !== "OWNER") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      } else if (isLoggedIn && nextUrl.pathname === "/admin/login") {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as "USER" | "ADMIN" | "OWNER";
      }
      return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
