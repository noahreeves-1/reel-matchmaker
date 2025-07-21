"use client";

import { MovieCard } from "@/components/movies";
import { TMDBMovie } from "@/lib/tmdb";

// MOVIE GRID: Grid layout for displaying multiple movies
// This component renders a responsive grid of movie cards with pagination
interface MovieGridProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
  userRatings?: Record<number, number>;
  wantToWatchList?: number[];
  onOpenRatingModal?: (movieId: number) => void;
  onToggleWantToWatch?: (movie: TMDBMovie, isInWantToWatch: boolean) => void;
  ratingLoadingStates?: Record<number, boolean>;
  wantToWatchLoadingStates?: Record<number, boolean>;
  hasMoreMovies?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export const MovieGrid = ({
  movies,
  isLoading = false,
  userRatings = {},
  wantToWatchList = [],
  onOpenRatingModal,
  onToggleWantToWatch,
  ratingLoadingStates = {},
  wantToWatchLoadingStates = {},
  hasMoreMovies = false,
  isLoadingMore = false,
  onLoadMore,
}: MovieGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse"
          >
            <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700"></div>
            <div className="p-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            userRating={userRatings[movie.id]}
            isInWantToWatch={wantToWatchList.includes(movie.id)}
            onOpenRatingModal={
              onOpenRatingModal ? () => onOpenRatingModal(movie.id) : undefined
            }
            onToggleWantToWatch={onToggleWantToWatch}
            isRatingLoading={ratingLoadingStates[movie.id] || false}
            isWantToWatchLoading={wantToWatchLoadingStates[movie.id] || false}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreMovies && onLoadMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              "Load More Movies"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
