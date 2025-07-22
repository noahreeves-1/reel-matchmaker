import type { NextAuthConfig } from "next-auth";

// AUTH CONFIG: NextAuth configuration for route protection and callbacks
// This file defines which routes require authentication and custom callbacks
// Providers are defined in auth.ts to avoid duplication

export const authConfig = {
  pages: { signIn: "/login" }, // custom sign‑in page
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const onDashboard = nextUrl.pathname.startsWith("/my-movies");

      if (onDashboard) return loggedIn; // gate dashboard
      return true; // public routes stay public, logged-in users can access home page
    },
  },
  providers: [], // will add Credentials next
} satisfies NextAuthConfig;
