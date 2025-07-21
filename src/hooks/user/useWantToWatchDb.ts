import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { WantToWatchMovie } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";

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

interface WantToWatchItem {
  id: string;
  userId: string;
  movieId: number;
  priority: number;
  notes?: string;
  movieTitle?: string;
  posterPath?: string;
  releaseDate?: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  wantToWatch?: WantToWatchItem[];
  wantToWatchItem?: WantToWatchItem;
  removedItem?: WantToWatchItem;
  error?: string;
}

/**
 * Hook for managing user's want-to-watch list with database persistence
 */
export const useWantToWatchDb = () => {
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

  const loadWantToWatchList = async () => {
    if (!session?.user?.email) {
      setWantToWatchList([]);
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
            poster_path: item.posterPath,
            release_date: item.releaseDate,
            addedAt: item.addedAt,
          })
        );
        setWantToWatchList(convertedList);
      } else {
        setError(data.error || "Failed to load want-to-watch list");
        setWantToWatchList([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load want-to-watch list"
      );
      setWantToWatchList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWantToWatch = async (
    movieId: number,
    priority?: number,
    notes?: string
  ) => {
    if (!session?.user?.email) {
      setError("You must be logged in to add movies to your watch list");
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
        setError(data.error || "Failed to add to want-to-watch list");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add to want-to-watch list"
      );
      return false;
    }
  };

  const removeFromWantToWatch = async (movieId: number) => {
    if (!session?.user?.email) {
      setError("You must be logged in to remove movies from your watch list");
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
        setError(data.error || "Failed to remove from want-to-watch list");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove from want-to-watch list"
      );
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
  }, [session, status]);

  return {
    wantToWatchList,
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error || movieDetailsError,
    loadWantToWatchList,
    addToWantToWatch,
    removeFromWantToWatch,
    isInWantToWatch,
    isAuthenticated: status === "authenticated",
  };
};
