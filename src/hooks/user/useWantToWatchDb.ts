import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { WantToWatchMovie, WantToWatch } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";

// WANT TO WATCH HOOK: Database-backed want-to-watch list management
// This hook manages the user's want-to-watch list with database persistence and React Query
// It provides optimistic updates and real-time synchronization with the server

interface ApiResponse {
  success: boolean;
  wantToWatch?: WantToWatch[];
  wantToWatchItem?: WantToWatch;
  removedItem?: WantToWatch;
  error?: string;
}

/**
 * Hook for managing user's want-to-watch list with database persistence and React Query
 */
export const useWantToWatchDb = (initialData?: {
  wantToWatch: WantToWatch[];
}) => {
  const { data: session } = useSession();

  // REACT QUERY FOR WANT TO WATCH: Fetch want-to-watch list with caching and optimistic updates
  const {
    data: wantToWatchList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wantToWatch"],
    queryFn: async (): Promise<WantToWatchMovie[]> => {
      if (!session?.user?.email) {
        return [];
      }

      // If we have initial data, use it instead of making an API call
      if (initialData?.wantToWatch && initialData.wantToWatch.length > 0) {
        const convertedList: WantToWatchMovie[] = initialData.wantToWatch.map(
          (item: WantToWatch) => ({
            id: item.movieId,
            title: item.movieTitle || `Movie ${item.movieId}`,
            poster_path: item.posterPath || undefined,
            release_date: item.releaseDate || undefined,
            addedAt:
              typeof item.addedAt === "string"
                ? item.addedAt
                : item.addedAt.toISOString(),
          })
        );
        return convertedList;
      }

      const response = await fetch("/api/want-to-watch");
      const data: ApiResponse = await response.json();

      if (data.success && data.wantToWatch) {
        const convertedList: WantToWatchMovie[] = data.wantToWatch.map(
          (item) => ({
            id: item.movieId,
            title: item.movieTitle || `Movie ${item.movieId}`,
            poster_path: item.posterPath || undefined,
            release_date: item.releaseDate || undefined,
            addedAt:
              typeof item.addedAt === "string"
                ? item.addedAt
                : item.addedAt.toISOString(),
          })
        );
        return convertedList;
      }

      return [];
    },
    enabled: !!session?.user?.email,
    staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection
    initialData: initialData?.wantToWatch
      ? initialData.wantToWatch.map((item: WantToWatch) => ({
          id: item.movieId,
          title: item.movieTitle || `Movie ${item.movieId}`,
          poster_path: item.posterPath || undefined,
          release_date: item.releaseDate || undefined,
          addedAt:
            typeof item.addedAt === "string"
              ? item.addedAt
              : item.addedAt.toISOString(),
        }))
      : undefined,
  });

  // Get movie IDs for React Query
  const movieIds = wantToWatchList.map((movie) => movie.id);

  // Use React Query to fetch movie details
  const {
    data: movieDetails = {},
    isLoading: movieDetailsLoading,
    error: movieDetailsError,
  } = useMovieDetailsBatch(movieIds);

  // Merge movie details with want-to-watch movies to get actual titles
  const wantToWatchListWithDetails = wantToWatchList.map((movie) => {
    const details = movieDetails[movie.id];
    return {
      ...movie,
      title: details?.title || movie.title, // Use actual title if available
      poster_path: details?.poster_path || movie.poster_path || null,
      release_date: details?.release_date || movie.release_date || undefined,
    };
  });

  return {
    wantToWatchList: wantToWatchListWithDetails, // Return merged data with actual titles
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error?.message || movieDetailsError?.message || null,
  };
};
