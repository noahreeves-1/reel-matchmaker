import { useState, useEffect } from "react";
import { getRatedMovies, removeRating } from "@/lib/localStorage";
import { RatedMovie } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";

// RATED MOVIES HOOK: User rating management with localStorage integration
// This hook manages user's rated movies with localStorage persistence and movie details
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: localStorage dependency, no server persistence, limited storage
// - VERCEL OPTIMIZATIONS: Client-side only, no server load, instant access
// - SCALE BREAKERS: localStorage size limits, no cross-device sync, data loss risk
// - FUTURE IMPROVEMENTS: Add PostgreSQL persistence, user authentication, cloud sync
//
// CURRENT USAGE: User rating management, movie details fetching, confirmation dialogs
// ARCHITECTURE: localStorage → React Query → Movie Details → UI Updates

/**
 * Hook for managing user's rated movies
 */
export const useRatedMovies = () => {
  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    movieId: number | null;
    movieTitle: string;
  }>({
    isOpen: false,
    movieId: null,
    movieTitle: "",
  });

  // Get movie IDs for React Query
  const movieIds = ratedMovies.map((movie) => movie.id);

  // Use React Query to fetch movie details
  const {
    data: movieDetails = {},
    isLoading,
    error,
  } = useMovieDetailsBatch(movieIds);

  const loadRatedMovies = () => {
    const movies = getRatedMovies();
    setRatedMovies(movies);
  };

  const openConfirmDialog = (movieId: number, movieTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      movieId,
      movieTitle,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      movieId: null,
      movieTitle: "",
    });
  };

  const handleRemoveRating = (movieId: number) => {
    removeRating(movieId);
    setRatedMovies((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  useEffect(() => {
    loadRatedMovies();
  }, []);

  return {
    ratedMovies,
    movieDetails,
    isLoading,
    error,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    handleRemoveRating,
  };
};
