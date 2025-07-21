import { Suspense } from "react";
import { MyMoviesPage } from "./MyMoviesPage";
import { LoadingSkeleton } from "@/components/common";
import type { UserInitialData } from "@/types/movie";

// RENDERING STRATEGY: Server Component for SSR
// - This component handles server-side data fetching and initial rendering
// - Passes data to client component for interactivity
// - Benefits: Fast initial load, good SEO, server-side authentication
// - Perfect for: User-specific pages that need server-side data
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Server-side processing, authentication complexity, no client-side state
// - VERCEL OPTIMIZATIONS: Serverless functions, edge caching, automatic scaling
// - SCALE BREAKERS: High concurrent users, database connection limits
// - FUTURE IMPROVEMENTS: Add caching, optimistic updates, real-time sync

interface MyMoviesPageServerProps {
  initialData?: UserInitialData;
}

export function MyMoviesPageServer({ initialData }: MyMoviesPageServerProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MyMoviesPage initialData={initialData} />
    </Suspense>
  );
}
