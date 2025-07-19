"use client";

import { useState } from "react";
import {
  Header,
  Hero,
  MovieGrid,
  RecommendationsSection,
  Footer,
  RatingModal,
  ErrorDisplay,
  MovieSearch,
} from "@/components/movies";
import { Recommendation, RatedMovie } from "@/types/movie";
import { useLocalStorage, STORAGE_KEYS, TMDBMovie } from "@/lib";
import { useMovies, useRatingModal } from "@/hooks";
import { TMDBResponse } from "@/lib/tmdb";

interface MovieAppProps {
  initialMovies?: TMDBResponse;
}

export const MovieApp = ({ initialMovies }: MovieAppProps) => {
  const [ratedMovies, setRatedMovies] = useLocalStorage<RatedMovie[]>(
    STORAGE_KEYS.RATED_MOVIES,
    []
  );
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false);

  const {
    movies,
    isLoadingMovies,
    movieError,
    hasMoreMovies,
    isLoadingMore,
    loadMoreMovies,
    refetch,
    searchQuery,
    isSearching,
    performSearch,
    clearSearch,
  } = useMovies(initialMovies);

  const { ratingModal, openRatingModal, closeRatingModal } = useRatingModal();

  const handleRateMovie = (movieId: number, rating: number) => {
    const movie = movies.find((m: TMDBMovie) => m.id === movieId);
    if (!movie) return;

    setRatedMovies((prev: RatedMovie[]) => {
      const existingIndex = prev.findIndex(
        (rm: RatedMovie) => rm.id === movieId
      );
      const newRatedMovie: RatedMovie = {
        id: movieId,
        title: movie.title,
        rating,
        poster_path: movie.poster_path || undefined,
        release_date: movie.release_date,
      };

      if (existingIndex >= 0) {
        // Update existing rating
        const newArray = [...prev];
        newArray[existingIndex] = newRatedMovie;
        return newArray;
      } else {
        // Add new rating
        return [...prev, newRatedMovie];
      }
    });
  };

  const handleOpenRatingModal = (movie: TMDBMovie) => {
    openRatingModal(movie);
  };

  const handleCloseRatingModal = () => {
    closeRatingModal();
  };

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    // TODO: Implement AI recommendation logic with ratings
    // For now, just simulate a delay
    setTimeout(() => {
      const newRecommendations = [
        {
          title: "Sample Movie 1",
          reason: "Based on your high ratings of action films",
        },
        {
          title: "Sample Movie 2",
          reason: "Similar to movies you rated 8+ stars",
        },
        {
          title: "Sample Movie 3",
          reason: "Recommended based on your rating patterns",
        },
      ];

      setRecommendations(newRecommendations);
      setIsGeneratingRecommendations(false);
    }, 2000);
  };

  const currentRating = ratingModal.movie
    ? ratedMovies.find((rm) => rm.id === ratingModal.movie?.id)?.rating
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />

        <RecommendationsSection
          ratedMoviesCount={ratedMovies.length}
          onGenerateRecommendations={handleGenerateRecommendations}
          isLoading={isGeneratingRecommendations}
          recommendations={recommendations}
        />

        <MovieSearch
          onSearch={performSearch}
          onClear={clearSearch}
          isLoading={isSearching}
          searchQuery={searchQuery}
        />

        {movieError ? (
          <ErrorDisplay error={movieError} onRetry={refetch} />
        ) : (
          <MovieGrid
            isLoading={isLoadingMovies || isSearching}
            movies={movies}
            ratedMovies={ratedMovies}
            onRateMovie={handleRateMovie}
            onOpenRatingModal={handleOpenRatingModal}
            onLoadMore={loadMoreMovies}
            hasMoreMovies={hasMoreMovies}
            isLoadingMore={isLoadingMore}
            searchQuery={searchQuery}
          />
        )}
      </main>

      <Footer />

      {/* Rating Modal */}
      {ratingModal.movie && (
        <RatingModal
          movie={ratingModal.movie}
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          onRate={handleRateMovie}
          currentRating={currentRating}
        />
      )}
    </div>
  );
};
