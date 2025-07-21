import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { WantToWatchMovie, WantToWatch } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";
import { handleApiError } from "@/lib/errorHandling";

// WANT TO WATCH HOOK: Database-based watch list management
// This hook manages user's want-to-watch list with PostgreSQL persistence via Drizzle
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Server dependency, network latency, authentication required
// - VERCEL OPTIMIZATIONS: Edge functions, serverless database, real-time sync
// - SCALE BREAKERS: Database connection limits, authentication complexity
// - FUTURE IMPROVEMENTS: Caching, optimistic updates, offline support
//
// CURRENT USAGE: Watch list management, movie details fetching, priority management
// ARCHITECTURE: Database → API → React Query → Movie Details → UI Updates

interface ApiResponse {
  success: boolean;
  wantToWatch?: WantToWatch[];
  wantToWatchItem?: WantToWatch;
  removedItem?: WantToWatch;
  error?: string;
}

/**
 * Hook for managing user's want-to-watch list with database persistence
 */
export const useWantToWatchDb = (initialData?: {
  wantToWatch: WantToWatch[];
}) => {
  const { data: session, status } = useSession();
  const [wantToWatchList, setWantToWatchList] = useState<WantToWatchMovie[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get movie IDs for React Query
  const movieIds = wantToWatchList.map((movie) => movie.id);

  // Use React Query to fetch movie details
  const {
    data: movieDetails = {},
    isLoading: movieDetailsLoading,
    error: movieDetailsError,
  } = useMovieDetailsBatch(movieIds);

  const loadWantToWatchList = useCallback(async () => {
    if (!session?.user?.email) {
      setWantToWatchList([]);
      return;
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
      setWantToWatchList(convertedList);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/want-to-watch");
      const data: ApiResponse = await response.json();

      if (data.success && data.wantToWatch) {
        // Convert database items to WantToWatchMovie format
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
        setWantToWatchList(convertedList);
      } else {
        setError(
          handleApiError(data.error || "Failed to load want-to-watch list")
        );
        setWantToWatchList([]);
      }
    } catch (err) {
      setError(handleApiError(err));
      setWantToWatchList([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, initialData]);

  const addToWantToWatch = async (
    movieId: number,
    priority?: number,
    notes?: string
  ) => {
    if (!session?.user?.email) {
      setError(
        handleApiError("You must be logged in to add movies to your watch list")
      );
      return false;
    }

    try {
      const response = await fetch("/api/want-to-watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          priority: priority || 1,
          notes,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Refresh the want-to-watch list
        await loadWantToWatchList();
        return true;
      } else {
        setError(
          handleApiError(data.error || "Failed to add to want-to-watch list")
        );
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const removeFromWantToWatch = async (movieId: number) => {
    if (!session?.user?.email) {
      setError(
        handleApiError(
          "You must be logged in to remove movies from your watch list"
        )
      );
      return false;
    }

    try {
      const response = await fetch(`/api/want-to-watch/${movieId}`, {
        method: "DELETE",
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Remove from local state
        setWantToWatchList((prev) =>
          prev.filter((movie) => movie.id !== movieId)
        );
        return true;
      } else {
        setError(
          handleApiError(
            data.error || "Failed to remove from want-to-watch list"
          )
        );
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const isInWantToWatch = (movieId: number): boolean => {
    return wantToWatchList.some((movie) => movie.id === movieId);
  };

  // Load want-to-watch list when session changes
  useEffect(() => {
    if (status === "authenticated") {
      loadWantToWatchList();
    } else if (status === "unauthenticated") {
      setWantToWatchList([]);
    }
  }, [session, status, loadWantToWatchList]);

  return {
    wantToWatchList,
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error || movieDetailsError,
    loadWantToWatchList,
    addToWantToWatch,
    removeFromWantToWatch,
    isInWantToWatch,
  };
};
