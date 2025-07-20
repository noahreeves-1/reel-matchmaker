import { Suspense } from "react";
import { MovieApp } from "@/components";
import { LoadingSkeleton } from "@/components/common";
import { getInitialMovies } from "@/hooks/server";

// Static Metadata: This overrides the metadata from layout.tsx for this specific page
// This is used for SEO and social media sharing
export const metadata = {
  title: "Reel Matchmaker - AI Movie Recommendations",
  description:
    "Discover your next favorite movie with AI-powered recommendations based on your taste",
  keywords: ["movies", "recommendations", "AI", "TMDB", "streaming"],
};

// RENDERING STRATEGY: ISR (Incremental Static Regeneration)
// - This page is statically generated at build time for maximum performance
// - It's regenerated every hour (3600 seconds) to keep movie data fresh
// - Benefits: Fast loading, good SEO, reduced server load, fresh content
// - Perfect for: Content that changes occasionally but not constantly
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: 1-hour stale data, limited personalization, no real-time updates
// - VERCEL OPTIMIZATIONS: CDN caching, global distribution, automatic scaling
// - SCALE BREAKERS: High concurrent users hitting revalidation, TMDB rate limits
// - FUTURE IMPROVEMENTS: Add user-specific recommendations, real-time updates
export const revalidate = 3600; // 1 hour in seconds

// Home Page: This is a Server Component by default (no "use client" directive)
// Server Components can:
// - Fetch data directly (no useEffect needed)
// - Access server-side APIs and databases
// - Be rendered on the server for better performance
export default async function Home() {
  // Server-side data fetching: This runs on the server during build time or request time
  // The data is passed to the client component as props
  const initialMovies = await getInitialMovies();

  return (
    // Suspense: This enables streaming and progressive loading
    // The fallback is shown while the MovieApp component is loading
    // This improves perceived performance
    <Suspense fallback={<LoadingSkeleton />}>
      <MovieApp initialMovies={initialMovies} />
    </Suspense>
  );
}
