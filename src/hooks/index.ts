// Query hooks - for data fetching with React Query
export * from "./queries";

// User data hooks - for managing user-specific data
export * from "./user";

// UI state hooks - for managing UI state
export * from "./ui";

// Authentication hooks - for managing auth state
// (Using NextAuth.js v5 server-side auth + database-backed hooks)

// Note: Server-side data functions have been moved to @/lib/server-data.ts
// This keeps hooks folder focused on client-side React hooks only
