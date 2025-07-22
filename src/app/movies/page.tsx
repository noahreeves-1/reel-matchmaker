import { Suspense } from "react";
import { MovieGrid } from "@/components/movies";
import {
  LoadingSkeleton,
  Breadcrumb,
  PageHeader,
  PageContainer,
} from "@/components/common";
import { getInitialMovies } from "@/lib/server-functions";

// RENDERING STRATEGY: ISR (Incremental Static Regeneration)
// - This page is statically generated at build time for maximum performance
// - It's regenerated every hour to keep popular movies list fresh
// - Benefits: Fast loading, good SEO, reduced API calls
// - Perfect for: Popular movies list that changes daily but not hourly
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: 1-hour stale data, no personalization, limited filtering options
// - VERCEL OPTIMIZATIONS: Global CDN caching, automatic scaling, serverless functions
// - SCALE BREAKERS: High traffic during revalidation, TMDB rate limits
// - FUTURE IMPROVEMENTS: Add user preferences, advanced filtering, real-time trending
export const revalidate = 3600;

// Generate metadata for SEO
export const metadata = {
  title: "Popular Movies - Reel Matchmaker",
  description: "Discover the most popular movies trending right now",
  keywords: ["movies", "popular", "trending", "TMDB", "streaming"],
};

/**
 * Movies page component
 * Displays popular movies with ISR for optimal performance
 */
export default async function MoviesPage() {
  const movies = await getInitialMovies();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Popular Movies" },
  ];

  return (
    <PageContainer>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Popular Movies"
        description="Discover the most popular movies trending right now"
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <MovieGrid movies={movies.results} isLoading={false} />
      </Suspense>
    </PageContainer>
  );
}
