"use client";

import { MovieCard } from "./MovieCard";
import { TMDBMovie } from "@/lib/tmdb";
import { RatedMovie } from "@/types/movie";

interface MovieGridProps {
  movies?: TMDBMovie[];
  isLoading?: boolean;
  onRateMovie?: (movieId: number, rating: number) => void;
  ratedMovies?: RatedMovie[];
  onOpenRatingModal?: (movie: TMDBMovie) => void;
  onLoadMore?: () => void;
  hasMoreMovies?: boolean;
  isLoadingMore?: boolean;
  searchQuery?: string;
}

export const MovieGrid = ({
  movies = [],
  isLoading = true,
  onRateMovie,
  ratedMovies = [],
  onOpenRatingModal,
  onLoadMore,
  hasMoreMovies = false,
  isLoadingMore = false,
  searchQuery = "",
}: MovieGridProps) => {
  // Create a map for quick rating lookups
  const ratingMap = new Map(ratedMovies.map((rm) => [rm.id, rm.rating]));

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : "Popular Movies"}
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {isLoading ? "Loading movies..." : `${movies.length} movies`}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <MovieCard key={`skeleton-${index}`} isLoading={true} />
            ))
          : movies.length > 0
          ? movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onRateMovie={onRateMovie}
                userRating={ratingMap.get(movie.id)}
                onOpenRatingModal={onOpenRatingModal}
                isLoading={false}
              />
            ))
          : searchQuery && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">
                    No movies found for "{searchQuery}"
                  </p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              </div>
            )}
      </div>

      {/* Load More Button */}
      {!isLoading && hasMoreMovies && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              "See More Movies"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
