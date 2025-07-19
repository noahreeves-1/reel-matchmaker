import { Suspense } from "react";
import Link from "next/link";
import { MovieGrid } from "@/components/movies";
import { LoadingSkeleton } from "@/components/common";
import { getInitialMovies } from "@/hooks/server";

// ISR with 1 hour revalidation
export const revalidate = 3600;

// Generate metadata for SEO
export const metadata = {
  title: "Popular Movies - Reel Matchmaker",
  description: "Discover the most popular movies trending right now",
  keywords: ["movies", "popular", "trending", "TMDB", "streaming"],
};

export default async function MoviesPage() {
  const movies = await getInitialMovies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <li>
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <span className="text-slate-400">/</span>
          </li>
          <li className="text-slate-900 dark:text-white font-medium">
            Popular Movies
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Popular Movies
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Discover the most popular movies trending right now
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <MovieGrid
          movies={movies.results}
          isLoading={false}
          hasMoreMovies={movies.page < movies.total_pages}
        />
      </Suspense>
    </div>
  );
}
