"use client";

import { MovieCard } from "@/components/movies";
import { TMDBMovie } from "@/lib/tmdb";

// MOVIE GRID: Grid layout for displaying multiple movies
// This component renders a responsive grid of movie cards
interface MovieGridProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
  userRatings?: Record<number, number>;
  wantToWatchList?: number[];
  onOpenRatingModal?: (movieId: number) => void;
  onToggleWantToWatch?: (movie: TMDBMovie, isInWantToWatch: boolean) => void;
  ratingLoadingStates?: Record<number, boolean>;
  wantToWatchLoadingStates?: Record<number, boolean>;
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
  );
};
