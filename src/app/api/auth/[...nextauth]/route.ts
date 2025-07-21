import { handlers } from "@/auth";

// NEXTAUTH API ROUTE: Required for NextAuth.js v5 authentication
// This route handles all authentication requests (signin, signout, session, etc.)
// The [...nextauth] catch-all route pattern matches all auth-related requests

export const { GET, POST } = handlers;
