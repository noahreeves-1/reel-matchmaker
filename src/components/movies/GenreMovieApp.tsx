"use client";

import { useState } from "react";
import { useRatedMoviesDb } from "@/hooks/user/useRatedMoviesDb";
import { useWantToWatchDb } from "@/hooks/user/useWantToWatchDb";
import { useMovieActionsDb } from "@/hooks/user/useMovieActionsDb";
import { MovieGrid, RatingModal } from "@/components/movies";
import { TMDBMovie } from "@/lib/tmdb";

// GENRE MOVIE APP: Interactive component for genre pages with user functionality
// This component provides rating and want-to-watch functionality for genre movie grids
// RENDERING STRATEGY: Client-Side Rendering (CSR) with Server Data
// - This component is rendered on the client side for interactivity
// - Receives movie data from server components (PPR/ISR pages)
// - Benefits: Interactive features, real-time user data, consistent UX
// - Perfect for: Genre pages that need user interactions and localStorage access
// - Why CSR? We need hooks, event handlers, and localStorage for user interactions
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Larger bundle size, no SSR benefits, localStorage limitations
// - VERCEL OPTIMIZATIONS: Static asset optimization, CDN caching, client-side processing
// - SCALE BREAKERS: localStorage size limits, no server-side user state
// - FUTURE IMPROVEMENTS: Add server-side user state, hybrid rendering

interface GenreMovieAppProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
  hasMoreMovies?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export const GenreMovieApp = ({
  movies,
  isLoading = false,
  hasMoreMovies = false,
  isLoadingMore = false,
  onLoadMore,
}: GenreMovieAppProps) => {
  // Database-backed hooks for user data
  const { ratedMovies } = useRatedMoviesDb();
  const { wantToWatchList } = useWantToWatchDb();

  // Movie Actions Hook: Includes optimistic updates
  const { rateMovie, removeRating, toggleWantToWatch } = useMovieActionsDb();

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

  // Wrapper function for MovieGrid that expects movieId
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
      handleCloseRatingModal();
    } catch (error) {
      console.error("Error rating movie from modal:", error);
    }
  };

  const handleRemoveRatingFromModal = async (movie: { id: number }) => {
    try {
      await removeRating(movie.id);
      handleCloseRatingModal();
    } catch (error) {
      console.error("Error removing rating from modal:", error);
    }
  };

  // Note: handleRateMovie is available for future use if needed
  // const handleRateMovie = async (movieId: number, rating: number) => {
  //   try {
  //     // Find the movie in the movies array
  //     const movie = movies.find((m) => m.id === movieId);
  //     if (movie) {
  //       await rateMovie(movie, rating);
  //     }
  //   } catch (error) {
  //     console.error("Error rating movie:", error);
  //   }
  // };

  // Wrapper function for MovieGrid to match MovieCard expected signature
  const handleToggleWantToWatchForGrid = async (
    movie: TMDBMovie,
    isInWantToWatch: boolean
  ) => {
    try {
      await toggleWantToWatch(movie, isInWantToWatch);
    } catch (error) {
      console.error("Error toggling want-to-watch:", error);
    }
  };

  return (
    <div>
      {/* Movie Grid Section */}
      <MovieGrid
        isLoading={isLoading}
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
        onLoadMore={onLoadMore}
      />

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
