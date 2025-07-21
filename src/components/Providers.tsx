"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

// PROVIDERS: Global state and context providers
// This component wraps the app with necessary providers for:
// - React Query (data fetching and caching)
// - NextAuth (authentication state) - SessionProvider for client-side auth
// - Any other global state management

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  // Create a new QueryClient instance for each session
  // This ensures clean state between different users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retry failed requests up to 3 times
            retry: 3,
            // Refetch on window focus (good for keeping data fresh)
            refetchOnWindowFocus: true,
            // Stale time for queries (how long data is considered fresh)
            staleTime: 1000 * 60 * 5, // 5 minutes
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
