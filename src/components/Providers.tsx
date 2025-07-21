"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

// PROVIDERS: Global state and context providers with dual-caching architecture
// This component wraps the app with necessary providers for:
// - React Query (client-side data fetching and caching)
// - NextAuth (authentication state) - SessionProvider for client-side auth
// - Any other global state management
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR for API responses
// - CLIENT-SIDE: React Query caching with configurable stale times and garbage collection
// - BACKGROUND REFETCH: Automatic refetch on window focus for data freshness
// - OPTIMISTIC UPDATES: Immediate UI feedback with background synchronization
//
// REACT QUERY CONFIGURATION:
// - DEFAULT STALE TIME: 5 minutes for most queries
// - RETRY LOGIC: 3 retries for failed requests
// - WINDOW FOCUS: Refetch on window focus for data freshness
// - SESSION-BASED: New QueryClient per session for clean state

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  // Create a new QueryClient instance for each session
  // This ensures clean state between different users and prevents cache pollution
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retry failed requests up to 3 times for resilience
            retry: 3,
            // Refetch on window focus (good for keeping data fresh)
            // This works with our dual-caching architecture
            refetchOnWindowFocus: true,
            // Default stale time for queries (how long data is considered fresh)
            // Individual queries can override this with their own stale times
            staleTime: 1000 * 60 * 5, // 5 minutes - balanced freshness vs performance
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
};
