"use client";

import { useState } from "react";
import { useMovies } from "@/hooks";
import { useRatedMoviesDb } from "@/hooks/user/useRatedMoviesDb";
import { useWantToWatchDb } from "@/hooks/user/useWantToWatchDb";
import { useRecommendations } from "@/hooks/user/useRecommendations";
import { useMovieActionsDb } from "@/hooks/user/useMovieActionsDb";
import {
  MovieGrid,
  RecommendationsSection,
  RatingModal,
} from "@/components/movies";
import { MovieRecommendation } from "@/types/movie";
import { TMDBMovie } from "@/lib/tmdb";

// MOVIE APP: Main interactive component with server-side data fetching
// This component handles its own data fetching to keep the page static
// RENDERING STRATEGY: Client-Side Rendering (CSR) with Server Data
// - This component is rendered on the client side for interactivity
// - Fetches initial data from server (ISR pages) for fast initial load
// - Benefits: Interactive features, real-time user data, fast subsequent navigation
// - Perfect for: Interactive pages that need user interactions and localStorage access
// - Why CSR? We need hooks, event handlers, and localStorage for user interactions
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Larger bundle size, no SSR benefits, localStorage limitations
// - VERCEL OPTIMIZATIONS: Static asset optimization, CDN caching, client-side processing
// - SCALE BREAKERS: localStorage size limits, no server-side user state, limited SEO
// - FUTURE IMPROVEMENTS: Add server-side user state, hybrid rendering, better SEO

export const MovieApp = () => {
  // Custom Hooks: These encapsulate complex logic and state management
  // Each hook has a single responsibility and can be reused across components

  // Database-backed hooks for user data
  const { ratedMovies } = useRatedMoviesDb();
  const { wantToWatchList } = useWantToWatchDb();

  // Recommendations Hook: Manages AI-powered movie recommendations
  // Pass the actual ratedMovies and wantToWatchList to ensure consistency
  const {
    recommendations,
    isGeneratingRecommendations,
    isLoadingLastRecommendations,
    generateRecommendations,
  } = useRecommendations(ratedMovies, wantToWatchList);

  // Movie Actions Hook: Now includes optimistic updates
  const { rateMovie, removeRating, toggleWantToWatch } = useMovieActionsDb();

  // Movies Hook: Manages movie data fetching, search, and pagination
  // This hook handles both popular movies and search results
  const {
    movies,
    isLoadingMovies,
    hasMoreMovies,
    isLoadingMore,
    loadMoreMovies,
    searchQuery,
    isSearching,
    performSearch,
    clearSearch,
  } = useMovies(); // No initial data - fetches from API

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    movie: TMDBMovie | null;
  }>({
    isOpen: false,
    movie: null,
  });

  // Rating functionality
  const handleOpenRatingModal = (movie: TMDBMovie) => {
    setRatingModal({
      isOpen: true,
      movie,
    });
  };

  // Wrapper function for RecommendationsSection that expects movieId
  const handleOpenRatingModalById = (movieId: number) => {
    // Find the movie in the movies array
    const movie = movies.find((m) => m.id === movieId);
    if (movie) {
      handleOpenRatingModal(movie);
    }
  };

  const handleCloseRatingModal = () => {
    setRatingModal({
      isOpen: false,
      movie: null,
    });
  };

  const handleRateMovieFromModal = async (
    movie: {
      id: number;
      title: string;
      poster_path?: string | null;
      release_date?: string;
      overview?: string;
    },
    rating: number
  ) => {
    try {
      // Convert to TMDBMovie format
      const tmdbMovie: TMDBMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        release_date: movie.release_date || "",
        overview: movie.overview || "",
        vote_average: 0,
        vote_count: 0,
        backdrop_path: null,
        genre_ids: [],
        popularity: 0,
        adult: false,
        original_language: "en",
        original_title: movie.title,
        video: false,
      };

      await rateMovie(tmdbMovie, rating);

      // Close the modal
      handleCloseRatingModal();
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error rating movie:", error);
    }
  };

  // Rating removal functionality with optimistic updates
  const handleRemoveRatingFromModal = async (movie: { id: number }) => {
    try {
      await removeRating(movie.id);
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error removing rating:", error);
    }
  };

  // Wrapper functions to match RecommendationsSection expected signatures
  // Now uses optimistic updates - no manual loading states needed
  const handleRateMovie = async (movieId: number, rating: number) => {
    try {
      // Find the movie in recommendations to get the full movie object
      const movie = recommendations.find((rec) => rec.id === movieId);
      if (movie) {
        // Convert MovieRecommendation to TMDBMovie format
        const tmdbMovie = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          overview: movie.overview,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          backdrop_path: null,
          genre_ids: [],
          popularity: movie.popularity || 0,
          adult: false,
          original_language: "en",
          original_title: movie.title,
          video: false,
        };
        await rateMovie(tmdbMovie, rating);
        // No need to manually refresh - React Query handles this with optimistic updates
      }
    } catch (error) {
      console.error("Error rating movie:", error);
    }
  };

  const handleToggleWantToWatch = async (
    movie: MovieRecommendation,
    isInWantToWatch: boolean
  ) => {
    try {
      // Convert MovieRecommendation to TMDBMovie format
      const tmdbMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        backdrop_path: null,
        genre_ids: [],
        popularity: movie.popularity || 0,
        adult: false,
        original_language: "en",
        original_title: movie.title,
        video: false,
      };
      await toggleWantToWatch(tmdbMovie, isInWantToWatch);
      // No need to manually refresh - React Query handles this
    } catch (error) {
      console.error("Error toggling want-to-watch:", error);
    }
  };

  // Wrapper function for MovieGrid to match MovieCard expected signature
  const handleToggleWantToWatchForGrid = async (
    movie: TMDBMovie,
    isInWantToWatch: boolean
  ) => {
    try {
      await toggleWantToWatch(movie, isInWantToWatch);
      // No need to manually refresh - React Query handles this
    } catch (error) {
      console.error("Error toggling want-to-watch:", error);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI Recommendations Section */}
        <RecommendationsSection
          ratedMoviesCount={ratedMovies.length}
          ratedMovies={ratedMovies}
          wantToWatchCount={wantToWatchList.length}
          wantToWatchList={wantToWatchList}
          onGenerateRecommendations={generateRecommendations}
          onRateMovie={handleRateMovie}
          isLoading={isGeneratingRecommendations}
          recommendations={recommendations}
          ratingLoadingStates={{}}
          wantToWatchLoadingStates={{}}
          onToggleWantToWatch={handleToggleWantToWatch}
          isLoadingLastRecommendations={isLoadingLastRecommendations}
        />

        {/* Movie Grid Section */}
        <MovieGrid
          isLoading={isLoadingMovies || isSearching}
          movies={movies}
          userRatings={Object.fromEntries(
            ratedMovies.map((movie) => [movie.id, movie.rating])
          )}
          wantToWatchList={wantToWatchList.map((movie) => movie.id)}
          onOpenRatingModal={handleOpenRatingModalById}
          onToggleWantToWatch={handleToggleWantToWatchForGrid}
          ratingLoadingStates={{}}
          wantToWatchLoadingStates={{}}
          hasMoreMovies={hasMoreMovies}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMoreMovies}
          onSearch={performSearch}
          onClear={clearSearch}
          searchQuery={searchQuery}
          isSearchLoading={isSearching}
        />
      </div>

      {/* Rating Modal */}
      {ratingModal.movie && (
        <RatingModal
          movie={ratingModal.movie}
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          onRate={handleRateMovieFromModal}
          onRemoveRating={handleRemoveRatingFromModal}
          currentRating={
            ratedMovies.find((rm) => rm.id === ratingModal.movie!.id)?.rating
          }
        />
      )}
    </div>
  );
};
