import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "@/lib/api";
import { TMDBMovie } from "@/lib/tmdb";

// React Query hooks for individual and batch movie detail fetching
//
// DUAL-CACHING: Next.js ISR (24h) + React Query (24h stale, 7-day GC)
// BATCH PROCESSING: Efficient handling with stable query keys and partial success
// LONG CACHE: 24-hour stale time due to stable movie metadata

export const useMovieDetails = (movieId: number | null) => {
  return useQuery({
    queryKey: ["movie", "details", movieId],
    queryFn: () => {
      return getMovieDetails(movieId!);
    },
    enabled: !!movieId,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};

export const useMovieDetailsBatch = (movieIds: number[]) => {
  const sortedIds = [...movieIds].sort();
  const idsHash = sortedIds.join(",");

  return useQuery({
    queryKey: ["movies", "details", idsHash],
    queryFn: async () => {
      const validIds = movieIds.filter((id) => id && !isNaN(id));

      if (validIds.length === 0) {
        return {};
      }

      const moviePromises = validIds.map(async (id) => {
        try {
          const movie = await getMovieDetails(id);
          return { id, movie, success: true };
        } catch (error) {
          console.warn(`❌ Failed to fetch movie ${id}:`, error);
          return { id, movie: null, success: false };
        }
      });

      const results = await Promise.allSettled(moviePromises);

      const movieMap: Record<number, TMDBMovie> = {};
      results.forEach((result) => {
        if (
          result.status === "fulfilled" &&
          result.value.success &&
          result.value.movie
        ) {
          movieMap[result.value.id] = result.value.movie;
        }
      });

      return movieMap;
    },
    enabled: movieIds.length > 0,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: (failureCount) => {
      if (failureCount < 2) {
        return true;
      }
      return false;
    },
  });
};
