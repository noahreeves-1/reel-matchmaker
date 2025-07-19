import { Suspense } from "react";
import { MovieGrid } from "@/components/movies";
import { LoadingSkeleton } from "@/components/common";

// ISR with 1 hour revalidation
export const revalidate = 3600;

// Generate metadata for SEO
export const metadata = {
  title: "Popular Movies - ReelTaste",
  description: "Discover the most popular movies trending right now",
};

// Pre-fetch movies for ISR
async function getMovies() {
  try {
    // Use internal API route - more reliable for environment variables
    const response = await fetch("http://localhost:3000/api/movies?page=1", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch movies");
    }

    const movies = await response.json();
    return movies;
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

export default async function MoviesPage() {
  const movies = await getMovies();

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
