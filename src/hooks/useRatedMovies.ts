import { useState, useEffect } from "react";
import { getRatedMovies, removeRating } from "../lib/localStorage";
import { RatedMovie } from "../types/movie";
import { useMovieDetailsBatch } from "./useMovieDetails";

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
