import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "@/lib/api";
import { TMDBMovie } from "@/lib/tmdb";

// MOVIE DETAILS QUERY HOOKS: Individual and batch movie detail fetching
// This file provides hooks for fetching detailed movie information with caching
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Individual requests vs. batch requests, cache size vs. performance
// - VERCEL OPTIMIZATIONS: React Query deduplication, intelligent caching, background updates
// - SCALE BREAKERS: Many concurrent requests, large cache sizes, API rate limits
// - FUTURE IMPROVEMENTS: Add request batching, cache persistence, prefetching
//
// CURRENT USAGE: Movie detail pages, user movie lists, recommendation display
// PERFORMANCE: Long cache times (24h), batch processing, memory-efficient storage

/**
 * Hook for fetching a single movie's details
 */
export const useMovieDetails = (movieId: number | null) => {
  return useQuery({
    queryKey: ["movie", "details", movieId],
    queryFn: () => {
      return getMovieDetails(movieId!);
    },
    enabled: !!movieId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

/**
 * Hook for fetching multiple movies' details in batch
 * Optimized to handle large batches efficiently
 */
export const useMovieDetailsBatch = (movieIds: number[]) => {
  // Create a stable query key that doesn't change when order changes
  const sortedIds = [...movieIds].sort();
  const idsHash = sortedIds.join(",");

  return useQuery({
    queryKey: ["movies", "details", idsHash],
    queryFn: async () => {
      // Filter out any invalid IDs
      const validIds = movieIds.filter((id) => id && !isNaN(id));

      if (validIds.length === 0) {
        return {};
      }

      // Use Promise.allSettled to handle partial failures gracefully
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

      // Build the movie map, filtering out failed requests
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

      // console.log(
      //   `🎬 Batch fetch complete. Successfully fetched ${
      //     Object.keys(movieMap).length
      //   }/${validIds.length} movies`
      // );
      return movieMap;
    },
    enabled: movieIds.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    // Add retry logic for failed requests
    retry: (failureCount) => {
      // Only retry up to 2 times for network errors
      if (failureCount < 2) {
        return true;
      }
      return false;
    },
  });
};
