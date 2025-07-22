import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { RatedMovie, UserRating } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";
import { handleApiError } from "@/lib/errorHandling";

// RATED MOVIES HOOK: Database-based user rating management with React Query
// This hook manages user's rated movies with PostgreSQL persistence via Drizzle
// Now uses React Query for data fetching to support optimistic updates
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
 * Hook for managing user's rated movies with database persistence and React Query
 */
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

  // REACT QUERY FOR RATED MOVIES: Fetch rated movies with caching and optimistic updates
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
        return convertedRatedMovies;
      }

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
        return convertedRatedMovies;
      } else {
        throw new Error(
          handleApiError(data.error || "Failed to load rated movies")
        );
      }
    },
    enabled: session?.user?.email !== undefined, // Only run query when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes - user data can change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection
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

  // Get movie IDs for React Query
  const movieIds = ratedMovies.map((movie) => movie.id);

  // Use React Query to fetch movie details
  const {
    data: movieDetails = {},
    isLoading: movieDetailsLoading,
    error: movieDetailsError,
  } = useMovieDetailsBatch(movieIds);

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
    ratedMovies,
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error?.message || movieDetailsError?.message || null,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
  };
};
