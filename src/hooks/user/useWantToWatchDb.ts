import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { WantToWatchMovie, WantToWatch } from "@/types/movie";
import { useMovieDetailsBatch } from "../queries/useMovieDetails";

// Database-backed want-to-watch list management with React Query caching
// Provides optimistic updates and real-time synchronization with the server

interface ApiResponse {
  success: boolean;
  wantToWatch?: WantToWatch[];
  wantToWatchItem?: WantToWatch;
  removedItem?: WantToWatch;
  error?: string;
}

export const useWantToWatchDb = (initialData?: {
  wantToWatch: WantToWatch[];
}) => {
  const { data: session } = useSession();

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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
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

  const movieIds = wantToWatchList.map((movie) => movie.id);

  const {
    data: movieDetails = {},
    isLoading: movieDetailsLoading,
    error: movieDetailsError,
  } = useMovieDetailsBatch(movieIds);

  const wantToWatchListWithDetails = wantToWatchList.map((movie) => {
    const details = movieDetails[movie.id];
    return {
      ...movie,
      title: details?.title || movie.title,
      poster_path: details?.poster_path || movie.poster_path || null,
      release_date: details?.release_date || movie.release_date || undefined,
    };
  });

  return {
    wantToWatchList: wantToWatchListWithDetails,
    movieDetails,
    isLoading: isLoading || movieDetailsLoading,
    error: error?.message || movieDetailsError?.message || null,
  };
};
