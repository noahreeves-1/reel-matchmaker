"use client";

import { Suspense } from "react";
import { MovieGrid } from "./MovieGrid";
import { LoadingSkeleton } from "@/components/common";
import { TMDBMovie } from "@/lib/tmdb";
import { RatedMovie } from "@/types/movie";

interface StreamingMovieGridProps {
  initialMovies?: TMDBMovie[];
  ratedMovies?: RatedMovie[];
  // onRateMovie?: (movieId: number, rating: number) => void; // Unused - keeping for future use
  onOpenRatingModal?: (movieId: number) => void;
  // onLoadMore?: () => void; // Unused - keeping for future use
  // hasMoreMovies?: boolean; // Unused - keeping for future use
  // isLoadingMore?: boolean; // Unused - keeping for future use
  // searchQuery?: string; // Unused - keeping for future use
}

export const StreamingMovieGrid = ({
  initialMovies,
  ratedMovies,
  onOpenRatingModal,
}: StreamingMovieGridProps) => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MovieGrid
        movies={initialMovies || []}
        userRatings={Object.fromEntries(
          (ratedMovies || []).map((movie) => [movie.id, movie.rating])
        )}
        wantToWatchList={[]}
        onOpenRatingModal={onOpenRatingModal}
        onToggleWantToWatch={undefined}
      />
    </Suspense>
  );
};
