import type { NextAuthConfig } from "next-auth";

// NextAuth configuration for route protection and callbacks
// This file defines which routes require authentication and custom callbacks
// Providers are defined in auth.ts to avoid duplication

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const myMoviesPage = nextUrl.pathname.startsWith("/my-movies");

      if (myMoviesPage) return loggedIn;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
