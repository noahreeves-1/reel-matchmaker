"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// Providers Component: This MUST be a Client Component (hence "use client")
// Server Components cannot use hooks, browser APIs, or event handlers
// This component provides React Query context to the entire app
export const Providers = ({ children }: { children: React.ReactNode }) => {
  // useState with function initializer: This ensures QueryClient is only created once
  // Without this, a new QueryClient would be created on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60 * 24, // 24 hours - how long data is considered fresh
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - how long to keep unused data in cache
            retry: 1, // Only retry failed requests once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
