import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getInitialGenres, getMoviesByGenreData } from "@/lib/server-functions";
import {
  Breadcrumb,
  PageHeader,
  PageContainer,
  LoadingSkeleton,
} from "@/components/common";
import { GenreMovieApp } from "@/components/movies";
import { GenrePageTracker } from "@/components/movies/GenrePageTracker";

// RENDERING STRATEGY: Incremental Static Regeneration (ISR)
// - This page is statically generated at build time for maximum performance
// - It's regenerated every hour to keep genre movie lists fresh
// - Benefits: Fast loading, good SEO, reduced API calls
// - Perfect for: Genre movie lists that change daily but not hourly
//
// ISR IMPLEMENTATION:
// - STATIC GENERATION: Pre-render popular genre pages at build time
// - REVALIDATION: 1-hour revalidation for fresh movie data
// - FALLBACK: On-demand generation for less popular genres
// - CACHING: Aggressive caching with stale-while-revalidate
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: 1-hour stale data, no personalization, limited filtering
// - VERCEL OPTIMIZATIONS: Global CDN caching, automatic scaling, serverless functions
// - SCALE BREAKERS: High traffic during revalidation, TMDB rate limits
// - FUTURE IMPROVEMENTS: Add user preferences, advanced filtering, real-time trending

// ISR: Revalidate every hour for fresh genre movie data
export const revalidate = 3600; // 1 hour - genre movies change daily

/**
 * STATIC GENERATION: Pre-generate popular genre pages at build time
 * This function tells Next.js which genre IDs to pre-generate as static pages
 * Benefits: Faster initial loads for popular genres, better SEO, reduced server load
 *
 * Next.js will:
 * 1. Call this function at build time
 * 2. Pre-generate static HTML for each popular genre
 * 3. Serve these pages instantly from CDN
 * 4. Fall back to on-demand generation for other genres
 */
export async function generateStaticParams() {
  try {
    const genresData = await getInitialGenres();

    // Pre-generate ALL genres for optimal performance
    // Genres are stable and rarely change, so this is safe
    return genresData.genres.map((genre: { id: number }) => ({
      id: genre.id.toString(),
    }));
  } catch {
    console.warn("Error generating static params for genres");
    return [];
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const genresData = await getInitialGenres();
    const genre = genresData.genres.find(
      (g: { id: number }) => g.id.toString() === id
    );

    if (!genre) {
      return {
        title: "Genre Not Found - Reel Matchmaker",
        description: "The requested movie genre could not be found",
      };
    }

    return {
      title: `${genre.name} Movies - Reel Matchmaker`,
      description: `Discover the best ${genre.name.toLowerCase()} movies - from classics to new releases`,
      keywords: ["movies", genre.name.toLowerCase(), "TMDB", "streaming"],
    };
  } catch {
    return {
      title: "Genre Movies - Reel Matchmaker",
      description: "Discover movies by genre",
    };
  }
}

/**
 * Genre page component with ISR
 * Displays movies for a specific genre with static generation
 */
export default async function GenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genreId = parseInt(id);

  if (isNaN(genreId)) {
    notFound();
  }

  try {
    // Fetch genre info and movies in parallel
    const [genresData, moviesData] = await Promise.all([
      getInitialGenres(),
      getMoviesByGenreData(genreId, 1),
    ]);

    const genre = genresData.genres.find(
      (g: { id: number }) => g.id === genreId
    );

    if (!genre) {
      notFound();
    }

    const breadcrumbItems = [
      { label: "Home", href: "/" },
      { label: "Genres", href: "/genres" },
      { label: genre.name },
    ];

    return (
      <PageContainer>
        {/* Track genre page for breadcrumb navigation */}
        <GenrePageTracker genreId={genre.id} genreName={genre.name} />

        <Breadcrumb items={breadcrumbItems} />

        <PageHeader
          title={`${genre.name} Movies`}
          description={`Discover the best ${genre.name.toLowerCase()} movies - from classics to new releases`}
        />

        <Suspense fallback={<LoadingSkeleton />}>
          <GenreMovieApp movies={moviesData.results} isLoading={false} />
        </Suspense>

        {/* Pagination info */}
        <div className="mt-8 text-center text-slate-600 dark:text-slate-400">
          <p>
            Showing {moviesData.results.length} of {moviesData.total_results}{" "}
            movies
          </p>
          <p className="text-sm mt-2">
            Page {moviesData.page} of {moviesData.total_pages}
          </p>
        </div>
      </PageContainer>
    );
  } catch {
    console.error("Error loading genre page");
    notFound();
  }
}
