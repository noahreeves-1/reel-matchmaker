import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { RatedMovie, UserRating } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";
import { handleApiError } from "@/lib/errorHandling";

// Database-based user rating management with React Query
// Manages user's rated movies with PostgreSQL persistence via Drizzle
// Uses React Query for data fetching with optimistic updates and batch processing

interface ApiResponse {
  success: boolean;
  ratings?: UserRating[];
  rating?: UserRating;
  error?: string;
}

export const useRatedMoviesDb = (initialData?: { ratings: UserRating[] }) => {
  const { data: session } = useSession();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    movieId: number | null;
    movieTitle: string;
  }>({
    isOpen: false,
    movieId: null,
    movieTitle: "",
  });

  const {
    data: ratedMovies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ratedMovies"],
    queryFn: async (): Promise<RatedMovie[]> => {
      if (!session?.user?.email) {
        return [];
      }

      if (initialData?.ratings && initialData.ratings.length > 0) {
        const convertedRatedMovies: RatedMovie[] = initialData.ratings.map(
          (rating: UserRating) => ({
            id: rating.movieId,
            title: `Movie ${rating.movieId}`,
            rating: rating.rating,
            ratedAt:
              typeof rating.ratedAt === "string"
                ? rating.ratedAt
                : rating.ratedAt.toISOString(),
          })
        );
        return convertedRatedMovies;
      }

      const response = await fetch("/api/user-ratings");
      const data: ApiResponse = await response.json();

      if (data.success && data.ratings) {
        const convertedRatedMovies: RatedMovie[] = data.ratings.map(
          (rating) => ({
            id: rating.movieId,
            title: `Movie ${rating.movieId}`,
            rating: rating.rating,
            ratedAt:
              typeof rating.ratedAt === "string"
                ? rating.ratedAt
                : rating.ratedAt.toISOString(),
          })
        );
        return convertedRatedMovies;
      } else {
        throw new Error(
          handleApiError(data.error || "Failed to load rated movies")
        );
      }
    },
    enabled: session?.user?.email !== undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    initialData: initialData?.ratings
      ? initialData.ratings.map((rating: UserRating) => ({
          id: rating.movieId,
          title: `Movie ${rating.movieId}`,
          rating: rating.rating,
          ratedAt:
            typeof rating.ratedAt === "string"
              ? rating.ratedAt
              : rating.ratedAt.toISOString(),
        }))
      : undefined,
  });

  const movieIds = ratedMovies.map((movie) => movie.id);

  const {
    data: movieDetails = {},
    isLoading: movieDetailsLoading,
    error: movieDetailsError,
  } = useMovieDetailsBatch(movieIds);

  const ratedMoviesWithDetails = ratedMovies.map((movie) => {
    const details = movieDetails[movie.id];
    return {
      ...movie,
      title: details?.title || movie.title,
      poster_path: details?.poster_path || null,
      release_date: details?.release_date || undefined,
    };
  });

  const removeRating = async (movieId: number) => {
    try {
      const response = await fetch(`/api/user-ratings/${movieId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          handleApiError(errorData.error || "Failed to remove rating")
        );
      }

      return true;
    } catch (error) {
      console.error("Error removing rating:", error);
      throw error;
    }
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

  return {
    ratedMovies: ratedMoviesWithDetails,
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error?.message || movieDetailsError?.message || null,
    removeRating,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
  };
};
