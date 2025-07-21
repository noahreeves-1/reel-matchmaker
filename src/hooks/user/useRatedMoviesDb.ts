import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RatedMovie, UserRating } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";
import { handleApiError } from "@/lib/errorHandling";

// RATED MOVIES HOOK: Database-based user rating management
// This hook manages user's rated movies with PostgreSQL persistence via Drizzle
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Server dependency, network latency, authentication required
// - VERCEL OPTIMIZATIONS: Edge functions, serverless database, real-time sync
// - SCALE BREAKERS: Database connection limits, authentication complexity
// - FUTURE IMPROVEMENTS: Caching, optimistic updates, offline support
//
// CURRENT USAGE: User rating management, movie details fetching, confirmation dialogs
// ARCHITECTURE: Database → API → React Query → Movie Details → UI Updates
//
// PERFORMANCE: Uses batch queries with stable keys to prevent unnecessary refetches
// The query key uses a hash of sorted IDs for consistent caching

interface ApiResponse {
  success: boolean;
  ratings?: UserRating[];
  rating?: UserRating;
  error?: string;
}

/**
 * Hook for managing user's rated movies with database persistence
 */
export const useRatedMoviesDb = (initialData?: { ratings: UserRating[] }) => {
  const { data: session, status } = useSession();
  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    isLoading: movieDetailsLoading,
    error: movieDetailsError,
  } = useMovieDetailsBatch(movieIds);

  const loadRatedMovies = useCallback(async () => {
    if (!session?.user?.email) {
      setRatedMovies([]);
      return;
    }

    // If we have initial data, use it instead of making an API call
    if (initialData?.ratings && initialData.ratings.length > 0) {
      const convertedRatedMovies: RatedMovie[] = initialData.ratings.map(
        (rating: UserRating) => ({
          id: rating.movieId,
          title: `Movie ${rating.movieId}`, // Placeholder title, will be filled by movieDetails
          rating: rating.rating,
          ratedAt:
            typeof rating.ratedAt === "string"
              ? rating.ratedAt
              : rating.ratedAt.toISOString(),
        })
      );
      setRatedMovies(convertedRatedMovies);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-ratings");
      const data: ApiResponse = await response.json();

      if (data.success && data.ratings) {
        // Convert database ratings to RatedMovie format
        const convertedRatedMovies: RatedMovie[] = data.ratings.map(
          (rating) => ({
            id: rating.movieId,
            title: `Movie ${rating.movieId}`, // Placeholder title, will be filled by movieDetails
            rating: rating.rating,
            ratedAt:
              typeof rating.ratedAt === "string"
                ? rating.ratedAt
                : rating.ratedAt.toISOString(),
          })
        );
        setRatedMovies(convertedRatedMovies);
      } else {
        setError(handleApiError(data.error || "Failed to load rated movies"));
        setRatedMovies([]);
      }
    } catch (err) {
      setError(handleApiError(err));
      setRatedMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, initialData]);

  const saveRating = async (
    movieId: number,
    rating: number,
    notes?: string
  ) => {
    if (!session?.user?.email) {
      setError(handleApiError("You must be logged in to rate movies"));
      return false;
    }

    try {
      const response = await fetch("/api/user-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          rating,
          notes,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Refresh the rated movies list
        await loadRatedMovies();
        return true;
      } else {
        setError(handleApiError(data.error || "Failed to save rating"));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const removeRating = async (movieId: number) => {
    if (!session?.user?.email) {
      setError(handleApiError("You must be logged in to remove ratings"));
      return false;
    }

    try {
      const response = await fetch(`/api/user-ratings/${movieId}`, {
        method: "DELETE",
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Remove from local state
        setRatedMovies((prev) => prev.filter((movie) => movie.id !== movieId));
        return true;
      } else {
        setError(handleApiError(data.error || "Failed to remove rating"));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
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

  const handleRemoveRating = async (movieId: number) => {
    const success = await removeRating(movieId);
    if (success) {
      closeConfirmDialog();
    }
  };

  // Load rated movies when session changes
  useEffect(() => {
    if (status === "authenticated") {
      loadRatedMovies();
    } else if (status === "unauthenticated") {
      setRatedMovies([]);
    }
  }, [session, status, loadRatedMovies]);

  return {
    ratedMovies,
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error || movieDetailsError,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    handleRemoveRating,
    loadRatedMovies,
    saveRating,
    removeRating,
  };
};
