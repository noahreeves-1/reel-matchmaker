import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "@/lib/api";
import { TMDBMovie } from "@/lib/tmdb";

// MOVIE DETAILS QUERY HOOKS: Individual and batch movie detail fetching
// This file provides hooks for fetching detailed movie information with extended caching
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (24-hour revalidation)
// - CLIENT-SIDE: React Query caching with 24-hour stale time + 7-day garbage collection
// - BATCH PROCESSING: Efficient handling of multiple movie details with stable query keys
// - ERROR HANDLING: Graceful failure handling with partial success support
//
// CACHING STRATEGY:
// - MOVIE DETAILS: 24-hour stale time (movie metadata rarely changes)
// - GARBAGE COLLECTION: 7-day cleanup (extended due to stable nature of movie data)
// - BATCH QUERIES: Stable query keys prevent unnecessary refetches
// - RETRY LOGIC: Limited retries for network failures
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Individual requests vs. batch requests, cache size vs. performance
// - VERCEL OPTIMIZATIONS: React Query deduplication, intelligent caching, background updates
// - SCALE BREAKERS: Many concurrent requests, large cache sizes, API rate limits
// - FUTURE IMPROVEMENTS: Request batching, cache persistence, prefetching
//
// CURRENT USAGE: Movie detail pages, user movie lists, recommendation display
// PERFORMANCE: Long cache times (24h), batch processing, memory-efficient storage

/**
 * Hook for fetching a single movie's details
 * Uses extended caching due to movie metadata stability
 */
export const useMovieDetails = (movieId: number | null) => {
  return useQuery({
    queryKey: ["movie", "details", movieId],
    queryFn: () => {
      return getMovieDetails(movieId!);
    },
    enabled: !!movieId, // Only run query when movieId is provided
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - movie data is very stable
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - extended due to data stability
  });
};

/**
 * Hook for fetching multiple movies' details in batch
 * Optimized to handle large batches efficiently with stable query keys
 */
export const useMovieDetailsBatch = (movieIds: number[]) => {
  // Create a stable query key that doesn't change when order changes
  // This prevents unnecessary refetches when the array order changes
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
      // This ensures that if some movies fail to fetch, others still succeed
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
    enabled: movieIds.length > 0, // Only run query when there are movie IDs
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - movie data is very stable
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - extended due to data stability
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
