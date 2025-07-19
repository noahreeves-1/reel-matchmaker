import { Suspense } from "react";
import { MovieGrid } from "@/components/movies";
import { LoadingSkeleton } from "@/components/common";
import { getInitialMovies } from "@/hooks/server";

// ISR with 1 hour revalidation
export const revalidate = 3600;

// Generate metadata for SEO
export const metadata = {
  title: "Popular Movies - ReelTaste",
  description: "Discover the most popular movies trending right now",
};

export default async function MoviesPage() {
  const movies = await getInitialMovies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Popular Movies
      </h1>

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
