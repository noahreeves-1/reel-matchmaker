import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularMovies, searchMovies } from "@/lib/api";
import { TMDBResponse } from "@/lib/tmdb";
import { CACHE_CONFIG } from "@/lib/constants";
import { useState } from "react";

// MOVIE QUERY HOOKS: React Query integration for movie data fetching
// This file provides hooks for fetching popular movies and search results with intelligent caching
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (1 hour for popular, 30 min for search)
// - CLIENT-SIDE: React Query caching with 5-minute stale time + 30-minute garbage collection
// - BACKGROUND REFETCH: Automatic refetch on window focus for data freshness
// - INFINITE PAGINATION: Efficient pagination with React Query's infinite queries
//
// CACHING STRATEGY:
// - POPULAR MOVIES: 5-minute stale time (frequently accessed, rarely changes)
// - SEARCH RESULTS: 5-minute stale time (can change as new movies are added)
// - GARBAGE COLLECTION: 30-minute cleanup to prevent memory bloat
// - OPTIMISTIC UPDATES: Immediate UI feedback with background sync
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Client-side caching vs. memory usage, stale data vs. fresh data
// - VERCEL OPTIMIZATIONS: React Query caching, background refetching, optimistic updates
// - SCALE BREAKERS: Large cache sizes, memory leaks, stale cache invalidation
// - FUTURE IMPROVEMENTS: Server-side caching, cache persistence, prefetching
//
// CURRENT USAGE: Movie data fetching, search functionality, infinite pagination
// PERFORMANCE: Intelligent caching, background updates, memory management

/**
 * Hook for fetching popular movies with infinite pagination
 * Uses React Query's infinite query for efficient pagination and caching
 */
export const usePopularMovies = (initialData?: TMDBResponse) => {
  return useInfiniteQuery({
    queryKey: ["movies", "popular"],
    queryFn: ({ pageParam }) => getPopularMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [1],
        }
      : undefined,
    staleTime: CACHE_CONFIG.MOVIES_STALE_TIME, // 5 minutes - data changes infrequently
    gcTime: CACHE_CONFIG.MOVIES_GC_TIME, // 30 minutes - prevent memory bloat
  });
};

/**
 * Hook for searching movies with infinite pagination
 * Uses React Query's infinite query with conditional enabling based on search term
 */
export const useMovieSearch = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ["movies", "search", searchTerm],
    queryFn: ({ pageParam }) => searchMovies(searchTerm, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!searchTerm.trim(), // Only run query when search term exists
    staleTime: CACHE_CONFIG.MOVIES_STALE_TIME, // 5 minutes - search results can change
    gcTime: CACHE_CONFIG.MOVIES_GC_TIME, // 30 minutes - prevent memory bloat
  });
};

/**
 * Combined hook for movies (popular or search results)
 * Provides unified interface for both popular movies and search functionality
 */
export const useMovies = (initialData?: TMDBResponse) => {
  const [searchQuery, setSearchQuery] = useState("");

  const popularMoviesQuery = usePopularMovies(initialData);
  const searchMoviesQuery = useMovieSearch(searchQuery);

  // Determine which query to use based on search state
  const activeQuery = searchQuery.trim()
    ? searchMoviesQuery
    : popularMoviesQuery;

  const performSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Flatten all pages into a single array for easy consumption
  const movies = activeQuery.data?.pages.flatMap((page) => page.results) || [];

  return {
    movies,
    isLoadingMovies: activeQuery.isLoading,
    movieError: activeQuery.error?.message || null,
    hasMoreMovies: !!activeQuery.hasNextPage,
    isLoadingMore: activeQuery.isFetchingNextPage,
    loadMoreMovies: () => activeQuery.fetchNextPage(),
    refetch: () => activeQuery.refetch(),
    searchQuery,
    isSearching: searchMoviesQuery.isLoading,
    performSearch,
    clearSearch,
  };
};
