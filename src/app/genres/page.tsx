import { Suspense } from "react";
import Link from "next/link";
import { unstable_noStore } from "next/cache";
import { getInitialGenres, getMoviesByGenreData } from "@/hooks/server";
import {
  Breadcrumb,
  PageHeader,
  PageContainer,
  LoadingSkeleton,
} from "@/components/common";
import { GenreMovieApp } from "@/components/movies";
import { GenresPageTracker } from "@/components/movies/GenresPageTracker";

// RENDERING STRATEGY: Partial Prerendering (PPR)
// - This page uses PPR to show a static shell with dynamic holes
// - Static Shell: Genre grid layout, navigation, loading states (pre-rendered)
// - Dynamic Holes: Popular movies from each genre stream in parallel
// - Benefits: Fast initial load with genre UI, movies populate as they load
// - Perfect for: Genre discovery with real-time movie previews
//
// PPR IMPLEMENTATION:
// - STATIC SHELL: Genre buttons, page layout, navigation (build-time)
// - DYNAMIC HOLES: <PopularMoviesByGenre /> components (streamed)
// - PARALLEL STREAMING: Multiple genre movie lists load simultaneously
// - USER INTERACTION: Genres are clickable for navigation to genre pages
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Static shell vs. dynamic content, parallel streaming overhead
// - VERCEL OPTIMIZATIONS: PPR, global CDN, automatic scaling
// - SCALE BREAKERS: High concurrent requests, TMDB rate limits
// - FUTURE IMPROVEMENTS: Genre analytics, personalized recommendations

// Opt into PPR for this route and its children
export const experimental_ppr = true;

// Generate metadata for SEO
export const metadata = {
  title: "Movie Genres - Reel Matchmaker",
  description:
    "Explore movies by genre - Action, Comedy, Drama, Horror, and more",
  keywords: ["movies", "genres", "action", "comedy", "drama", "horror", "TMDB"],
};

/**
 * Genres page component with PPR
 * Shows static genre grid with dynamic movie previews
 */
export default async function GenresPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Genres" }];

  return (
    <PageContainer>
      {/* Track genres page for breadcrumb navigation */}
      <GenresPageTracker />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Movie Genres"
        description="Explore movies by genre - discover your next favorite film"
      />

      {/* Static Shell: Genre Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Browse by Genre
        </h2>
        <Suspense fallback={<GenreGridSkeleton />}>
          <GenreGrid />
        </Suspense>
      </div>

      {/* Dynamic Holes: Popular Movies by Genre */}
      <div className="space-y-12">
        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={28} genreName="Action" />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={35} genreName="Comedy" />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={18} genreName="Drama" />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={27} genreName="Horror" />
        </Suspense>
      </div>
    </PageContainer>
  );
}

/**
 * Genre Grid Component
 * Displays all available genres as clickable cards
 */
async function GenreGrid() {
  // Mark as dynamic to ensure fresh genre data
  unstable_noStore();
  const genresData = await getInitialGenres();
  const genres = genresData.genres;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/genres/${genre.id}`}
          className="group block p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {genre.name}
            </h3>
            <div className="mt-2 w-12 h-1 bg-blue-500 mx-auto rounded-full group-hover:w-16 transition-all duration-200"></div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * Popular Movies by Genre Component
 * Shows a preview of popular movies for a specific genre
 */
async function PopularMoviesByGenre({
  genreId,
  genreName,
}: {
  genreId: number;
  genreName: string;
}) {
  // Mark as dynamic to ensure fresh movie data
  unstable_noStore();
  const moviesData = await getMoviesByGenreData(genreId, 1);
  const movies = moviesData.results.slice(0, 6); // Show top 6 movies

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Popular {genreName} Movies
        </h3>
        <Link
          href={`/genres/${genreId}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
        >
          View All →
        </Link>
      </div>
      <GenreMovieApp movies={movies} isLoading={false} />
    </div>
  );
}

/**
 * Genre Grid Loading Skeleton
 */
function GenreGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
        >
          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded mx-auto"></div>
        </div>
      ))}
    </div>
  );
}
