"use client";

import { Suspense } from "react";
import { MovieGrid } from "./MovieGrid";
import { LoadingSkeleton } from "@/components/common";
import { TMDBMovie } from "@/lib/tmdb";
import { RatedMovie } from "@/types/movie";

interface StreamingMovieGridProps {
  initialMovies?: TMDBMovie[];
  ratedMovies?: RatedMovie[];
  onRateMovie?: (movieId: number, rating: number) => void;
  onOpenRatingModal?: (movie: TMDBMovie) => void;
  onLoadMore?: () => void;
  hasMoreMovies?: boolean;
  isLoadingMore?: boolean;
  searchQuery?: string;
}

export const StreamingMovieGrid = ({
  initialMovies,
  ratedMovies,
  onRateMovie,
  onOpenRatingModal,
  onLoadMore,
  hasMoreMovies,
  isLoadingMore,
  searchQuery,
}: StreamingMovieGridProps) => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MovieGrid
        movies={initialMovies || []}
        ratedMovies={ratedMovies || []}
        onRateMovie={onRateMovie}
        onOpenRatingModal={onOpenRatingModal}
        onLoadMore={onLoadMore}
        hasMoreMovies={hasMoreMovies}
        isLoadingMore={isLoadingMore}
        searchQuery={searchQuery}
      />
    </Suspense>
  );
};
