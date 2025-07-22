"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

// Global providers for React Query and NextAuth with dual-caching architecture
//
// DUAL-CACHING: Next.js ISR (server) + React Query (client) with 5-min stale time
// REACT QUERY: 3 retries, window focus refetch, session-based QueryClient

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            refetchOnWindowFocus: true,
            staleTime: 1000 * 60 * 5,
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
